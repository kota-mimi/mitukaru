import { NextRequest, NextResponse } from 'next/server'
import { filterAndSortProteins } from '@/lib/dummyProteins'
import { searchYahooProducts } from '@/lib/yahooApi'

interface SearchFilters {
  goal: string
  exercise: string
  about: string
  timing: string
  flavor: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filters: SearchFilters = {
    goal: searchParams.get('goal') || '',
    exercise: searchParams.get('exercise') || '',
    about: searchParams.get('about') || '',
    timing: searchParams.get('timing') || '',
    flavor: searchParams.get('flavor') || ''
  }

  console.log('診断結果:', filters)

  try {
    console.log('🔍 マルチプラットフォーム商品検索開始...')
    
    // 検索クエリを生成
    const searchQuery = generateSearchQuery(filters)
    console.log('📝 検索クエリ:', searchQuery)
    
    // 楽天とYahoo!から同時に商品を取得
    const [rakutenProducts, yahooProducts] = await Promise.all([
      searchRakutenAPI(filters),
      searchYahooProducts(searchQuery)
    ])
    
    console.log('📊 取得結果:', {
      rakuten: rakutenProducts.length,
      yahoo: yahooProducts.length
    })

    // 商品をマージして価格比較形式に変換
    const mergedProducts = mergeAndCompareProducts(rakutenProducts, yahooProducts, filters)
    
    console.log(`✅ 価格比較対応商品: ${mergedProducts.length}件`)

    return NextResponse.json({
      success: true,
      products: mergedProducts.slice(0, 10),
      totalFound: mergedProducts.length,
      searchQuery: searchQuery,
      platforms: {
        rakuten: { count: rakutenProducts.length, status: 'active' },
        yahoo: { count: yahooProducts.length, status: 'active' }
      },
      filters: {
        proteinType: determineProteinType(filters),
        budget: determineBudget(filters),
        proteinAmount: determineProteinAmount(filters)
      },
      source: 'multi_platform'
    })

  } catch (error: any) {
    console.error('プロテイン検索エラー:', error)
    return NextResponse.json({
      success: false,
      error: '商品検索中にエラーが発生しました',
      details: error.message
    }, { status: 500 })
  }
}

// 診断結果から検索クエリを生成
function generateSearchQuery(filters: SearchFilters): string {
  let query = 'プロテイン'
  
  if (filters.about === 'plant') {
    query += ' ソイ'
  } else {
    query += ' ホエイ'
  }
  
  if (filters.flavor === 'chocolate') {
    query += ' チョコ'
  } else if (filters.flavor === 'fruit') {
    query += ' ストロベリー'
  } else if (filters.flavor === 'other') {
    query += ' コーヒー'
  }
  
  return query
}

// プロテインタイプを決定
function determineProteinType(filters: SearchFilters): string {
  if (filters.about === 'plant') return 'ソイ'
  if (filters.goal === 'beauty') return 'ソイ'
  if (filters.timing === 'night') return 'カゼイン'
  return 'ホエイ'
}

// 予算を決定
function determineBudget(filters: SearchFilters): number {
  if (filters.about === 'budget') return 80
  if (filters.goal === 'beauty') return 150
  if (filters.exercise === 'heavy') return 120
  return 100
}

// 必要タンパク質量を決定  
function determineProteinAmount(filters: SearchFilters): number {
  let baseAmount = 18
  
  if (filters.exercise === 'heavy') baseAmount += 4  // 22g
  if (filters.exercise === 'light') baseAmount += 1  // 19g
  if (filters.about === 'male') baseAmount += 2     // 20g+
  if (filters.goal === 'muscle') baseAmount += 2    // 20g+
  
  return Math.min(baseAmount, 25) // 最大25g
}

// 楽天とYahoo!商品をマージして価格比較
function mergeAndCompareProducts(rakutenProducts: any[], yahooProducts: any[], filters: SearchFilters) {
  const allProducts: any[] = []
  
  // 楽天商品を追加
  rakutenProducts.forEach(product => {
    allProducts.push({
      ...product,
      platforms: [
        {
          platform: 'rakuten',
          price: product.bestPrice?.price || product.platforms?.[0]?.price,
          pricePerServing: product.bestPrice?.pricePerServing || product.platforms?.[0]?.pricePerServing,
          shopName: product.bestPrice?.shopName || product.platforms?.[0]?.shopName,
          affiliateUrl: product.bestPrice?.affiliateUrl || product.platforms?.[0]?.affiliateUrl,
          stock: product.bestPrice?.stock || { status: '在庫あり', quantity: 50, lowStock: false },
          shipping: product.bestPrice?.shipping || { freeShipping: true, deliveryDays: '2-3日', shippingCost: 0 }
        }
      ],
      bestPrice: null // 後で計算
    })
  })
  
  // Yahoo!商品を追加
  yahooProducts.forEach(product => {
    allProducts.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      reviewAverage: product.reviewAverage,
      reviewCount: product.reviewCount,
      description: product.description,
      nutrition: product.nutrition,
      type: product.type,
      flavor: product.flavor,
      platforms: [
        {
          platform: 'yahoo',
          price: product.price,
          pricePerServing: product.pricePerServing,
          shopName: product.shopName,
          affiliateUrl: product.affiliateUrl,
          stock: { status: '在庫あり', quantity: 50, lowStock: false },
          shipping: { freeShipping: true, deliveryDays: '2-3日', shippingCost: 0 }
        }
      ],
      bestPrice: null
    })
  })
  
  // 各商品の最安値を計算
  allProducts.forEach(product => {
    const bestPlatform = product.platforms.reduce((best: any, current: any) => {
      return current.pricePerServing < best.pricePerServing ? current : best
    })
    product.bestPrice = bestPlatform
  })
  
  // スコアでソート
  return allProducts
    .map(product => ({ ...product, score: calculateProductScore(product, filters) }))
    .sort((a, b) => b.score - a.score)
}

// 楽天API検索関数（商品配列を返すように変更）
async function searchRakutenAPI(filters: SearchFilters) {
  const rakutenAppId = process.env.RAKUTEN_APP_ID
  
  if (!rakutenAppId || rakutenAppId === 'your_rakuten_app_id_here') {
    console.log('⚠️ 楽天APIが設定されていません')
    return []
  }
  try {
    const searchQuery = generateSearchQuery(filters)
    
    const params = new URLSearchParams({
      applicationId: rakutenAppId,
      keyword: searchQuery,
      hits: '20',
      page: '1',
      sort: 'standard',
      formatVersion: '2'
    })
    
    const apiUrl = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?${params.toString()}`
    
    console.log('楽天API呼び出し:', { searchQuery, url: apiUrl })
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ProteinMatch/1.0'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`楽天API エラー: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    console.log('楽天API応答構造:', {
      hasItems: !!data.Items,
      itemsLength: data.Items?.length || 0,
      firstItemStructure: data.Items?.[0] ? Object.keys(data.Items[0]) : 'none'
    })
    
    if (!data.Items || data.Items.length === 0) {
      console.log('⚠️ 楽天APIで商品が見つかりませんでした')
      return []
    }

    // 商品データを処理・フィルタリング
    const processedProducts = data.Items
      .map((item: any) => {
        try {
          return processRakutenProduct(item, filters)
        } catch (error) {
          console.error('商品処理エラー:', error, 'アイテム:', item)
          return null
        }
      })
      .filter((product: any) => product && isValidProteinProduct(product, filters))
      .slice(0, 10)

    console.log(`✅ 楽天API: ${data.Items.length}件中、${processedProducts.length}件が適合`)
    return processedProducts

  } catch (error: any) {
    console.error('❌ 楽天API検索エラー:', error)
    return []
  }
}

// 楽天商品データ処理
function processRakutenProduct(product: any, filters: SearchFilters) {
  if (!product || !product.itemName) {
    throw new Error('Invalid product data: missing itemName')
  }
  
  const itemName = product.itemName || ''
  const description = product.itemCaption || ''
  const price = parseInt(product.itemPrice) || 0
  
  // 栄養成分を抽出
  const nutrition = extractNutritionFromDescription(description, itemName)
  
  // 1食あたりの価格を計算
  const pricePerServing = Math.round(price / (nutrition.servings || 30))
  
  return {
    id: `rakuten_${product.itemCode}`,
    name: itemName,
    brand: extractBrandFromName(itemName),
    imageUrl: product.mediumImageUrls?.[0] || product.smallImageUrls?.[0] || '',
    reviewAverage: parseFloat(product.reviewAverage) || 0,
    reviewCount: product.reviewCount || 0,
    description: description.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
    nutrition: nutrition,
    type: determineProductType(itemName),
    flavor: extractFlavorFromName(itemName),
    platforms: [{
      platform: 'rakuten' as const,
      price: price,
      pricePerServing: pricePerServing,
      shopName: product.shopName || '',
      affiliateUrl: generateRakutenAffiliateUrl(product.itemUrl, process.env.RAKUTEN_AFFILIATE_ID),
      stock: {
        status: '在庫あり', // 楽天APIからは詳細な在庫情報が取得できないため
        quantity: 50,
        lowStock: false
      },
      shipping: {
        freeShipping: product.postageFlag === 1,
        deliveryDays: '2-3日',
        shippingCost: product.postageFlag === 1 ? 0 : 550
      },
      sale: {
        onSale: false,
        discountRate: 0,
        saleEndTime: null
      }
    }],
    bestPrice: {
      platform: 'rakuten' as const,
      price: price,
      pricePerServing: pricePerServing,
      shopName: product.shopName || '',
      affiliateUrl: generateRakutenAffiliateUrl(product.itemUrl, process.env.RAKUTEN_AFFILIATE_ID),
      stock: {
        status: '在庫あり',
        quantity: 50,
        lowStock: false
      },
      shipping: {
        freeShipping: product.postageFlag === 1,
        deliveryDays: '2-3日',
        shippingCost: product.postageFlag === 1 ? 0 : 550
      },
      sale: {
        onSale: false,
        discountRate: 0,
        saleEndTime: null
      }
    },
    score: 0 // あとで計算
  }
}

// 栄養成分抽出
function extractNutritionFromDescription(description: string, itemName: string) {
  const proteinMatch = description.match(/たんぱく質[\s：]*(\d+(?:\.\d+)?)g/i) || 
                      description.match(/protein[\s：]*(\d+(?:\.\d+)?)g/i)
  const calorieMatch = description.match(/エネルギー[\s：]*(\d+(?:\.\d+)?)kcal/i) ||
                      description.match(/カロリー[\s：]*(\d+(?:\.\d+)?)kcal/i)
  
  return {
    protein: proteinMatch ? parseFloat(proteinMatch[1]) : estimateProteinContent(itemName),
    calories: calorieMatch ? parseFloat(calorieMatch[1]) : 110,
    servings: estimateServingsFromName(itemName),
    servingSize: 30
  }
}

// ブランド名抽出
function extractBrandFromName(itemName: string): string {
  const brands = ['ザバス', 'DNS', 'ビーレジェンド', 'マイプロテイン', 'アルプロン', 'エクスプロージョン', 'Kentai', 'HALEO', 'VITAS']
  for (const brand of brands) {
    if (itemName.includes(brand)) return brand
  }
  return 'その他'
}

// フレーバー抽出
function extractFlavorFromName(itemName: string): string {
  if (itemName.includes('チョコ') || itemName.includes('ココア')) return 'チョコレート'
  if (itemName.includes('ストロベリー') || itemName.includes('いちご')) return 'ストロベリー'
  if (itemName.includes('バニラ')) return 'バニラ'
  if (itemName.includes('バナナ')) return 'バナナ'
  if (itemName.includes('コーヒー') || itemName.includes('カフェオレ')) return 'コーヒー'
  if (itemName.includes('抹茶')) return '抹茶'
  if (itemName.includes('プレーン')) return 'プレーン'
  return 'その他'
}

// プロテイン含有量推定
function estimateProteinContent(itemName: string): number {
  if (itemName.includes('WPI')) return 22
  if (itemName.includes('ソイ') || itemName.includes('大豆')) return 17
  if (itemName.includes('カゼイン')) return 24
  return 20 // ホエイプロテインの平均
}

// 容量からサービング数推定
function estimateServingsFromName(itemName: string): number {
  const weightMatch = itemName.match(/(\d+(?:\.\d+)?)kg|(\d+)g/i)
  if (weightMatch) {
    let weight = parseFloat(weightMatch[1] || weightMatch[2])
    // kgの場合はgに変換
    if (weightMatch[1]) weight *= 1000
    return Math.round(weight / 30) // 1回30gと仮定
  }
  return 30 // デフォルト
}

// 商品タイプを決定
function determineProductType(itemName: string): string {
  if (itemName.includes('ソイ') || itemName.includes('大豆')) return 'ソイ'
  if (itemName.includes('カゼイン')) return 'カゼイン'
  if (itemName.includes('WPI')) return 'WPI'
  return 'ホエイ'
}

// プロテイン商品かどうかの判定
function isValidProteinProduct(product: any, filters: SearchFilters): boolean {
  const name = product.name.toLowerCase()
  
  // プロテイン商品の必須キーワード
  const proteinKeywords = ['プロテイン', 'protein', 'ホエイ', 'whey', 'ソイ', 'soy', 'カゼイン', 'casein']
  const hasProteinKeyword = proteinKeywords.some(keyword => name.includes(keyword.toLowerCase()))
  
  // 除外キーワード
  const excludeKeywords = ['シェイカー', 'ボトル', '計量', 'スプーン', 'サプリ']
  const hasExcludeKeyword = excludeKeywords.some(keyword => name.includes(keyword))
  
  // タンパク質含有量チェック
  const hasAdequateProtein = product.nutrition.protein >= 10
  
  // 価格チェック（異常に安い・高い商品を除外）
  const reasonablePrice = product.platforms[0].pricePerServing >= 50 && product.platforms[0].pricePerServing <= 500
  
  return hasProteinKeyword && !hasExcludeKeyword && hasAdequateProtein && reasonablePrice
}

// 楽天アフィリエイトURL生成
function generateRakutenAffiliateUrl(itemUrl: string, affiliateId?: string): string {
  if (!affiliateId) return itemUrl
  
  try {
    const url = new URL(itemUrl)
    url.searchParams.set('rafID', affiliateId)
    return url.toString()
  } catch {
    return itemUrl
  }
}

// 商品スコア計算
function calculateProductScore(product: any, filters: SearchFilters): number {
  let score = 0
  
  // レビュー評価 (40点)
  score += (product.reviewAverage || 0) * 8
  
  // レビュー数 (20点)
  score += Math.min((product.reviewCount || 0) / 50, 20)
  
  // 価格適正性 (25点)
  const budget = determineBudget(filters)
  const pricePerServing = product.bestPrice?.pricePerServing || 999
  if (pricePerServing <= budget * 0.8) score += 25
  else if (pricePerServing <= budget) score += 20
  else if (pricePerServing <= budget * 1.2) score += 10
  
  // タンパク質含有量 (15点)
  const protein = product.nutrition.protein
  if (protein >= 22) score += 15
  else if (protein >= 20) score += 12
  else if (protein >= 18) score += 8
  else if (protein >= 15) score += 5
  
  return score
}