import { NextResponse } from 'next/server'
import { saveFeaturedProductsCache } from '@/lib/cache'

// 人気商品取得のための検索パターン
const FEATURED_SEARCHES = [
  {
    name: '人気ホエイプロテイン',
    query: 'プロテイン ホエイ 人気',
    category: 'whey'
  },
  {
    name: '売れ筋ソイプロテイン',
    query: 'プロテイン ソイ 女性',
    category: 'soy'
  },
  {
    name: 'コスパ最強',
    query: 'プロテイン 安い コスパ',
    category: 'budget'
  },
  {
    name: '高評価商品',
    query: 'プロテイン 高評価 おすすめ',
    category: 'premium'
  }
]

// 毎日朝8時に実行される自動更新API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const authToken = searchParams.get('token')
  
  // 簡易認証（本番環境では環境変数から取得）
  if (authToken !== process.env.CACHE_UPDATE_TOKEN && authToken !== 'update-morning-8am') {
    return NextResponse.json({
      success: false,
      error: '認証が必要です'
    }, { status: 401 })
  }

  try {
    const rakutenAppId = process.env.RAKUTEN_APP_ID
    
    if (!rakutenAppId || rakutenAppId === 'your_rakuten_app_id_here') {
      return NextResponse.json({
        success: false,
        error: '楽天APIが設定されていません'
      })
    }

    console.log('🕐 朝8時の自動更新を開始します...', new Date().toLocaleString('ja-JP'))
    const allProducts = []

    // 各カテゴリから商品を取得
    for (const search of FEATURED_SEARCHES) {
      try {
        console.log(`📦 ${search.name}の商品を取得中...`)
        
        const params = new URLSearchParams({
          applicationId: rakutenAppId,
          keyword: search.query,
          hits: '5', // 各カテゴリから5件
          page: '1',
          sort: '-reviewCount', // レビュー数順（人気順）
          formatVersion: '2'
        })

        const apiUrl = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?${params.toString()}`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'ProteinMatch/1.0'
          }
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.Items && data.Items.length > 0) {
            const processedProducts = data.Items
              .map((item: any) => processRakutenProduct(item, search))
              .filter((product: any) => isValidProteinProduct(product))
              .slice(0, 3) // 上位3件のみ
            
            allProducts.push({
              category: search.category,
              categoryName: search.name,
              products: processedProducts
            })
            
            console.log(`✅ ${search.name}: ${processedProducts.length}件取得`)
          }
        }
        
        // APIレート制限対応（1秒間隔）
        await new Promise(resolve => setTimeout(resolve, 1100))
        
      } catch (error) {
        console.error(`❌ ${search.name}の取得エラー:`, error)
      }
    }

    // キャッシュに保存
    const cacheData = {
      success: true,
      categories: allProducts,
      totalCategories: allProducts.length,
      lastUpdated: new Date().toISOString(),
      updateTime: '朝8時自動更新'
    }

    await saveFeaturedProductsCache(cacheData)

    console.log(`🎉 朝8時の自動更新が完了しました！ ${allProducts.length}カテゴリ取得`)

    return NextResponse.json({
      success: true,
      message: `朝8時の自動更新完了！${allProducts.length}カテゴリの商品を更新しました`,
      categories: allProducts.length,
      timestamp: new Date().toLocaleString('ja-JP')
    })

  } catch (error: any) {
    console.error('❌ 朝8時自動更新エラー:', error)
    return NextResponse.json({
      success: false,
      error: '自動更新中にエラーが発生しました',
      details: error.message,
      timestamp: new Date().toLocaleString('ja-JP')
    }, { status: 500 })
  }
}

// 楽天商品データ処理（簡略版）
function processRakutenProduct(item: any, search: any) {
  const itemName = item.itemName || ''
  const description = item.itemCaption || ''
  const price = parseInt(item.itemPrice) || 0
  
  // 栄養成分を抽出（簡略版）
  const proteinMatch = description.match(/たんぱく質[\s：]*(\d+(?:\.\d+)?)g/i)
  const protein = proteinMatch ? parseFloat(proteinMatch[1]) : estimateProteinContent(itemName)
  
  const servings = estimateServingsFromName(itemName)
  const pricePerServing = Math.round(price / servings)
  
  return {
    id: `rakuten_${item.itemCode}`,
    name: itemName,
    brand: extractBrandFromName(itemName),
    imageUrl: item.mediumImageUrls?.[0]?.imageUrl || '',
    reviewAverage: parseFloat(item.reviewAverage) || 0,
    reviewCount: item.reviewCount || 0,
    description: description.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
    nutrition: {
      protein: protein,
      calories: 110,
      servings: servings,
      servingSize: 30
    },
    type: determineProductType(itemName),
    flavor: extractFlavorFromName(itemName),
    price: price,
    pricePerServing: pricePerServing,
    shopName: item.shopName || '',
    affiliateUrl: item.affiliateUrl || item.itemUrl,
    category: search.category
  }
}

// プロテイン商品かどうかの判定（簡略版）
function isValidProteinProduct(product: any): boolean {
  const name = product.name.toLowerCase()
  
  const proteinKeywords = ['プロテイン', 'protein', 'ホエイ', 'whey', 'ソイ', 'soy']
  const hasProteinKeyword = proteinKeywords.some(keyword => name.includes(keyword.toLowerCase()))
  
  const excludeKeywords = ['シェイカー', 'ボトル', '計量', 'スプーン']
  const hasExcludeKeyword = excludeKeywords.some(keyword => name.includes(keyword))
  
  const hasAdequateProtein = product.nutrition.protein >= 10
  const reasonablePrice = product.pricePerServing >= 30 && product.pricePerServing <= 300
  
  return hasProteinKeyword && !hasExcludeKeyword && hasAdequateProtein && reasonablePrice
}

// ヘルパー関数群
function extractBrandFromName(itemName: string): string {
  const brands = ['ザバス', 'DNS', 'ビーレジェンド', 'マイプロテイン', 'アルプロン', 'エクスプロージョン', 'Kentai', 'HALEO', 'VITAS', 'VALX']
  for (const brand of brands) {
    if (itemName.includes(brand)) return brand
  }
  return 'その他'
}

function extractFlavorFromName(itemName: string): string {
  if (itemName.includes('チョコ') || itemName.includes('ココア')) return 'チョコレート'
  if (itemName.includes('ストロベリー') || itemName.includes('いちご')) return 'ストロベリー'
  if (itemName.includes('バニラ')) return 'バニラ'
  if (itemName.includes('バナナ')) return 'バナナ'
  if (itemName.includes('プレーン')) return 'プレーン'
  return 'その他'
}

function determineProductType(itemName: string): string {
  if (itemName.includes('ソイ') || itemName.includes('大豆')) return 'ソイ'
  if (itemName.includes('カゼイン')) return 'カゼイン'
  if (itemName.includes('WPI')) return 'WPI'
  return 'ホエイ'
}

function estimateProteinContent(itemName: string): number {
  if (itemName.includes('WPI')) return 22
  if (itemName.includes('ソイ') || itemName.includes('大豆')) return 17
  if (itemName.includes('カゼイン')) return 24
  return 20
}

function estimateServingsFromName(itemName: string): number {
  const weightMatch = itemName.match(/(\d+(?:\.\d+)?)kg|(\d+)g/i)
  if (weightMatch) {
    let weight = parseFloat(weightMatch[1] || weightMatch[2])
    if (weightMatch[1]) weight *= 1000
    return Math.round(weight / 30)
  }
  return 30
}