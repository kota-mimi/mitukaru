import { NextResponse } from 'next/server'
import { saveFeaturedProductsCache } from '@/lib/cache'

// 楽天APIから取得する全プロテインカテゴリ
const FEATURED_SEARCHES = [
  // 基本プロテインタイプ
  {
    name: '人気ホエイプロテイン',
    query: 'ホエイプロテイン 人気 おすすめ',
    category: 'whey',
    hits: 10
  },
  {
    name: 'ソイプロテイン（大豆）',
    query: 'ソイプロテイン 大豆プロテイン',
    category: 'soy',
    hits: 8
  },
  {
    name: 'カゼインプロテイン',
    query: 'カゼインプロテイン 就寝前',
    category: 'casein',
    hits: 5
  },
  {
    name: 'WPIプロテイン',
    query: 'WPI ホエイプロテインアイソレート',
    category: 'wpi',
    hits: 6
  },
  
  // 人気ブランド別
  {
    name: 'ザバス（SAVAS）',
    query: 'ザバス SAVAS プロテイン',
    category: 'savas',
    hits: 8
  },
  {
    name: 'DNS プロテイン',
    query: 'DNS プロテイン',
    category: 'dns',
    hits: 6
  },
  {
    name: 'ビーレジェンド',
    query: 'ビーレジェンド beLEGEND プロテイン',
    category: 'belegend',
    hits: 8
  },
  {
    name: 'マイプロテイン',
    query: 'マイプロテイン MyProtein',
    category: 'myprotein',
    hits: 6
  },
  {
    name: 'アルプロン',
    query: 'アルプロン ALPRON プロテイン',
    category: 'alpron',
    hits: 6
  },
  {
    name: 'エクスプロージョン',
    query: 'エクスプロージョン X-PLOSION',
    category: 'xplosion',
    hits: 5
  },
  {
    name: 'VALX バルクス',
    query: 'VALX バルクス プロテイン',
    category: 'valx',
    hits: 5
  },
  {
    name: 'ゴールドジム',
    query: 'ゴールドジム GOLDSGYM プロテイン',
    category: 'goldsgym',
    hits: 5
  },
  
  // 用途別・目的別
  {
    name: 'ダイエット用プロテイン',
    query: 'プロテイン ダイエット 減量 女性',
    category: 'diet',
    hits: 8
  },
  {
    name: '筋トレ・筋肥大用',
    query: 'プロテイン 筋トレ 筋肥大 バルクアップ',
    category: 'muscle',
    hits: 8
  },
  {
    name: 'HMB配合プロテイン',
    query: 'プロテイン HMB配合',
    category: 'hmb',
    hits: 5
  },
  {
    name: '美容プロテイン',
    query: 'プロテイン 美容 コラーゲン 女性',
    category: 'beauty',
    hits: 6
  },
  {
    name: 'ジュニア・子供用',
    query: 'プロテイン ジュニア 子供 成長',
    category: 'junior',
    hits: 5
  },
  
  // 価格・コスパ重視
  {
    name: 'コスパ最強プロテイン',
    query: 'プロテイン 安い コスパ 激安',
    category: 'budget',
    hits: 10
  },
  {
    name: '大容量プロテイン',
    query: 'プロテイン 大容量 5kg 3kg',
    category: 'bulk',
    hits: 6
  },
  
  // フレーバー・味重視
  {
    name: 'チョコ味プロテイン',
    query: 'プロテイン チョコレート ココア',
    category: 'chocolate',
    hits: 8
  },
  {
    name: 'フルーツ味プロテイン',
    query: 'プロテイン ストロベリー バナナ',
    category: 'fruit',
    hits: 6
  },
  {
    name: '抹茶・和風味',
    query: 'プロテイン 抹茶 きなこ 和風',
    category: 'japanese',
    hits: 4
  },
  
  // 特殊カテゴリ
  {
    name: '無添加・オーガニック',
    query: 'プロテイン 無添加 オーガニック 自然',
    category: 'organic',
    hits: 5
  },
  {
    name: '国産プロテイン',
    query: 'プロテイン 国産 日本製',
    category: 'domestic',
    hits: 6
  },
  {
    name: '植物性プロテイン',
    query: 'プロテイン 植物性 ピープロテイン',
    category: 'plant',
    hits: 5
  },
  
  // 新商品・話題商品
  {
    name: '最新・話題のプロテイン',
    query: 'プロテイン 新商品 話題 2024',
    category: 'trending',
    hits: 6
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
          hits: search.hits.toString(), // 各カテゴリごとに設定された件数
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
              .slice(0, search.hits) // 各カテゴリごとに設定された件数を取得
            
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
    imageUrl: getHighQualityImageUrl(item.mediumImageUrls?.[0] || item.smallImageUrls?.[0] || ''),
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

// 高品質画像URL取得（楽天の画像サイズを500x500に変更）
function getHighQualityImageUrl(originalUrl: string): string {
  if (!originalUrl) return '';
  
  // 楽天の画像URLの場合、サイズパラメータを変更
  if (originalUrl.includes('thumbnail.image.rakuten.co.jp')) {
    // ?_ex=128x128 を ?_ex=500x500 に変更
    return originalUrl.replace(/\?_ex=\d+x\d+/, '?_ex=500x500');
  }
  
  return originalUrl;
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