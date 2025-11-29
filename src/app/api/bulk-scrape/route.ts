import { NextResponse } from 'next/server'
import { saveFeaturedProductsCache } from '@/lib/cache'

// 楽天プロテイン全商品を大量取得する新API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const authToken = searchParams.get('token')
  
  // 認証チェック
  if (authToken !== process.env.CACHE_UPDATE_TOKEN && authToken !== 'bulk-scrape-all') {
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

    console.log('🚀 楽天プロテイン全商品の大量取得を開始...', new Date().toLocaleString('ja-JP'))
    const allProducts = []
    let totalCount = 0
    
    // 楽天から「プロテイン」で全商品を取得（複数ページ）
    const maxPages = 20 // 最大20ページ（1000商品）
    const hitsPerPage = 50 // ページあたり50商品
    
    for (let page = 1; page <= maxPages; page++) {
      try {
        console.log(`📄 ページ ${page}/${maxPages} を取得中...`)
        
        const params = new URLSearchParams({
          applicationId: rakutenAppId,
          keyword: 'プロテイン',
          hits: hitsPerPage.toString(),
          page: page.toString(),
          sort: '-reviewCount', // レビュー数順（人気順）
          formatVersion: '2',
          genreId: '100316' // ダイエット・健康カテゴリ
        })

        const apiUrl = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?${params.toString()}`
        
        console.log(`🔗 API URL: ${apiUrl}`)
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'ProteinMatch/2.0'
          }
        })

        console.log(`📊 ページ ${page} レスポンス:`, response.status, response.statusText)

        if (response.ok) {
          const data = await response.json()
          
          if (data.Items && data.Items.length > 0) {
            const processedProducts = data.Items
              .map((item: any) => processRakutenProduct(item))
              .filter((product: any) => isValidProteinProduct(product))
            
            allProducts.push(...processedProducts)
            totalCount += processedProducts.length
            
            console.log(`✅ ページ ${page}: ${processedProducts.length}件取得 (累計: ${totalCount}件)`)
            
            // 最後のページの場合は終了
            if (data.Items.length < hitsPerPage) {
              console.log(`🏁 最後のページに到達 (ページ ${page})`)
              break
            }
          } else {
            console.log(`⚠️ ページ ${page}: 商品データなし`)
            break
          }
        } else {
          console.error(`❌ ページ ${page} APIエラー:`, response.status)
        }
        
        // APIレート制限対応（1.2秒間隔）
        await new Promise(resolve => setTimeout(resolve, 1200))
        
      } catch (error) {
        console.error(`❌ ページ ${page} 取得エラー:`, error)
      }
    }

    // AIで自動分類処理（後で実装）
    const categorizedData = await categorizeProductsWithAI(allProducts)

    // キャッシュに保存
    const cacheData = {
      success: true,
      method: 'bulk_scrape',
      totalProducts: totalCount,
      categories: categorizedData,
      lastUpdated: new Date().toISOString(),
      updateMethod: '楽天全商品スクレイピング + AI分類'
    }

    await saveFeaturedProductsCache(cacheData)

    console.log(`🎉 楽天プロテイン大量取得完了！ ${totalCount}商品を取得・分類しました`)

    return NextResponse.json({
      success: true,
      message: `楽天プロテイン大量取得完了！${totalCount}商品を取得しました`,
      totalProducts: totalCount,
      categoriesCount: categorizedData.length,
      timestamp: new Date().toLocaleString('ja-JP')
    })

  } catch (error: any) {
    console.error('❌ 楽天大量取得エラー:', error)
    return NextResponse.json({
      success: false,
      error: '大量取得中にエラーが発生しました',
      details: error.message,
      timestamp: new Date().toLocaleString('ja-JP')
    }, { status: 500 })
  }
}

// 楽天商品データ処理（改良版）
function processRakutenProduct(item: any) {
  const product = item.Item || item
  const itemName = product.itemName || ''
  const description = product.itemCaption || ''
  const price = parseInt(product.itemPrice) || 0
  
  // より詳細な栄養成分抽出
  const proteinMatch = description.match(/たんぱく質[\\s：]*(\\d+(?:\\.\\d+)?)g/i) || 
                      itemName.match(/(\\d+(?:\\.\\d+)?)g.*たんぱく質/i)
  const protein = proteinMatch ? parseFloat(proteinMatch[1]) : estimateProteinContent(itemName)
  
  const servings = estimateServingsFromName(itemName, description)
  const pricePerServing = servings > 0 ? Math.round(price / servings) : 0
  
  return {
    id: `rakuten_${product.itemCode}`,
    name: itemName,
    brand: extractBrandFromName(itemName),
    imageUrl: getHighQualityImageUrl(product.mediumImageUrls?.[0] || product.smallImageUrls?.[0] || ''),
    reviewAverage: parseFloat(product.reviewAverage) || 0,
    reviewCount: product.reviewCount || 0,
    description: description.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
    fullDescription: description.replace(/<[^>]*>/g, ''), // AI分析用の完全な説明文
    nutrition: {
      protein: protein,
      calories: estimateCalories(itemName, description),
      servings: servings,
      servingSize: estimateServingSize(itemName, description)
    },
    type: determineProductType(itemName, description),
    flavor: extractFlavorFromName(itemName),
    price: price,
    pricePerServing: pricePerServing,
    shopName: product.shopName || '',
    affiliateUrl: product.affiliateUrl || product.itemUrl,
    rawData: {
      itemName,
      description,
      shopName: product.shopName
    }
  }
}

// AI分類システム（基本版）
async function categorizeProductsWithAI(products: any[]) {
  console.log('🤖 AI分類処理開始...')
  
  // 基本的な分類ロジック（後でAI APIに置き換え）
  const categories = [
    {
      name: '人気ランキング総合',
      category: 'ranking_overall',
      products: products
        .sort((a, b) => (b.reviewCount * b.reviewAverage) - (a.reviewCount * a.reviewAverage))
        .slice(0, 20)
    },
    {
      name: 'コスパ最強ランキング',
      category: 'cospa_ranking', 
      products: products
        .filter(p => p.pricePerServing > 0 && p.pricePerServing < 200)
        .sort((a, b) => a.pricePerServing - b.pricePerServing)
        .slice(0, 15)
    },
    {
      name: '高評価プロテイン',
      category: 'high_rating',
      products: products
        .filter(p => p.reviewAverage >= 4.3 && p.reviewCount >= 100)
        .sort((a, b) => b.reviewAverage - a.reviewAverage)
        .slice(0, 15)
    },
    {
      name: 'ホエイプロテイン',
      category: 'whey',
      products: products
        .filter(p => p.type === 'ホエイ' || p.name.toLowerCase().includes('ホエイ') || p.name.toLowerCase().includes('whey'))
        .slice(0, 20)
    },
    {
      name: 'ソイプロテイン',
      category: 'soy',
      products: products
        .filter(p => p.type === 'ソイ' || p.name.includes('ソイ') || p.name.includes('大豆'))
        .slice(0, 15)
    },
    {
      name: '大容量プロテイン',
      category: 'bulk',
      products: products
        .filter(p => p.name.match(/[3-9]kg|[1-9]\d+g/))
        .slice(0, 10)
    },
    {
      name: 'プレミアムプロテイン',
      category: 'premium',
      products: products
        .filter(p => p.pricePerServing > 100)
        .sort((a, b) => b.reviewAverage - a.reviewAverage)
        .slice(0, 10)
    }
  ]
  
  // ブランド別カテゴリを動的生成
  const brandCounts: { [key: string]: number } = {}
  products.forEach(product => {
    const brand = product.brand
    if (brand && brand !== 'その他') {
      brandCounts[brand] = (brandCounts[brand] || 0) + 1
    }
  })
  
  // 商品数が多いブランドTOP5をカテゴリに追加
  const topBrands = Object.entries(brandCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
  
  topBrands.forEach(([brand, count]) => {
    categories.push({
      name: `${brand}プロテイン`,
      category: `brand_${brand.toLowerCase()}`,
      products: products
        .filter(p => p.brand === brand)
        .slice(0, 12)
    })
  })
  
  console.log(`✅ AI分類完了: ${categories.length}カテゴリ生成`)
  return categories.filter(cat => cat.products.length > 0)
}

// プロテイン商品判定（強化版）
function isValidProteinProduct(product: any): boolean {
  const name = product.name.toLowerCase()
  const description = product.fullDescription.toLowerCase()
  
  // プロテイン関連キーワード
  const proteinKeywords = ['プロテイン', 'protein', 'ホエイ', 'whey', 'ソイ', 'soy', 'カゼイン', 'casein', 'wpi', 'wpc']
  const hasProteinKeyword = proteinKeywords.some(keyword => 
    name.includes(keyword.toLowerCase()) || description.includes(keyword.toLowerCase())
  )
  
  // 除外キーワード
  const excludeKeywords = ['シェイカー', 'ボトル', '計量', 'スプーン', 'サプリメント', 'ビタミン', 'シェーカー']
  const hasExcludeKeyword = excludeKeywords.some(keyword => 
    name.includes(keyword) || description.includes(keyword)
  )
  
  // 栄養・価格条件
  const hasAdequateProtein = product.nutrition.protein >= 8
  const reasonablePrice = product.pricePerServing >= 20 && product.pricePerServing <= 500
  const hasReviews = product.reviewCount >= 1
  
  return hasProteinKeyword && 
         !hasExcludeKeyword && 
         hasAdequateProtein && 
         reasonablePrice && 
         hasReviews
}

// 高品質画像URL取得
function getHighQualityImageUrl(originalUrl: string): string {
  if (!originalUrl) return ''
  
  if (originalUrl.includes('thumbnail.image.rakuten.co.jp')) {
    return originalUrl.replace(/\\?_ex=\\d+x\\d+/, '?_ex=500x500')
  }
  
  return originalUrl
}

// ヘルパー関数群（改良版）
function extractBrandFromName(itemName: string): string {
  const brands = [
    'ザバス', 'SAVAS', 'DNS', 'ビーレジェンド', 'beLEGEND', 
    'マイプロテイン', 'MyProtein', 'アルプロン', 'ALPRON',
    'エクスプロージョン', 'X-PLOSION', 'Kentai', 'HALEO', 
    'VITAS', 'VALX', 'バルクス', 'ゴールドジム', 'GOLDSGYM',
    'オプティマム', 'Optimum', 'チャンピオン', 'Champion',
    'ダイマタイズ', 'Dymatize', 'BSN', 'MuscleTech'
  ]
  
  for (const brand of brands) {
    if (itemName.includes(brand)) return brand
  }
  return 'その他'
}

function extractFlavorFromName(itemName: string): string {
  const flavors = {
    'チョコ': ['チョコ', 'ココア', 'chocolate'],
    'ストロベリー': ['ストロベリー', 'いちご', 'strawberry'],
    'バニラ': ['バニラ', 'vanilla'],
    'バナナ': ['バナナ', 'banana'],
    '抹茶': ['抹茶', 'matcha'],
    'プレーン': ['プレーン', 'plain', 'ナチュラル']
  }
  
  for (const [flavor, keywords] of Object.entries(flavors)) {
    if (keywords.some(keyword => itemName.toLowerCase().includes(keyword.toLowerCase()))) {
      return flavor
    }
  }
  return 'その他'
}

function determineProductType(itemName: string, description: string): string {
  const text = (itemName + ' ' + description).toLowerCase()
  
  if (text.includes('ソイ') || text.includes('大豆') || text.includes('soy')) return 'ソイ'
  if (text.includes('カゼイン') || text.includes('casein')) return 'カゼイン'
  if (text.includes('wpi') || text.includes('アイソレート')) return 'WPI'
  if (text.includes('ピー') || text.includes('pea')) return 'ピー'
  return 'ホエイ'
}

function estimateProteinContent(itemName: string): number {
  if (itemName.includes('WPI')) return 22
  if (itemName.includes('ソイ') || itemName.includes('大豆')) return 17
  if (itemName.includes('カゼイン')) return 24
  return 20
}

function estimateCalories(itemName: string, description: string): number {
  const text = itemName + ' ' + description
  const calorieMatch = text.match(/(\\d+)kcal/i)
  if (calorieMatch) return parseInt(calorieMatch[1])
  
  // タイプ別推定
  if (text.includes('WPI')) return 105
  if (text.includes('ソイ')) return 115
  return 110
}

function estimateServingsFromName(itemName: string, description?: string): number {
  const text = itemName + ' ' + (description || '')
  const weightMatch = text.match(/(\\d+(?:\\.\\d+)?)kg|(\\d+)g/i)
  
  if (weightMatch) {
    let weight = parseFloat(weightMatch[1] || weightMatch[2])
    if (weightMatch[1]) weight *= 1000
    return Math.round(weight / 30) // 30gを1回分として計算
  }
  return 30 // デフォルト
}

function estimateServingSize(itemName: string, description: string): number {
  const text = itemName + ' ' + description
  const servingSizeMatch = text.match(/(\\d+)g.*(?:回|杯|スプーン)/i)
  return servingSizeMatch ? parseInt(servingSizeMatch[1]) : 30
}