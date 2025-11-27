// Yahoo!ショッピングAPI統合ライブラリ

export interface YahooProduct {
  id: string
  name: string
  brand: string
  imageUrl: string
  price: number
  pricePerServing: number
  description: string
  shopName: string
  affiliateUrl: string
  reviewAverage: number
  reviewCount: number
  nutrition: {
    protein: number
    calories: number
    servings: number
    servingSize: number
  }
  type: string
  flavor: string
  category: string
}

// Yahoo!ショッピングAPIから商品を検索
export async function searchYahooProducts(query: string, affiliateId?: string): Promise<YahooProduct[]> {
  const yahooAppId = process.env.YAHOO_APP_ID
  const defaultAffiliateId = process.env.YAHOO_AFFILIATE_ID
  
  if (!yahooAppId || yahooAppId === 'your_yahoo_app_id_here') {
    console.log('⚠️ Yahoo! APIが設定されていません。ダミーデータを返します。')
    return generateYahooDummyProducts(query)
  }

  try {
    const params = new URLSearchParams({
      appid: yahooAppId,
      query: query,
      hits: '20',
      offset: '1',
      sort: 'score', // 関連度順
      affiliate_type: 'vc', // ValueCommerce
      affiliate_id: affiliateId || defaultAffiliateId || '',
      image_size: '300'
    })

    const apiUrl = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?${params.toString()}`
    
    console.log('🛒 Yahoo!ショッピングAPI呼び出し:', { query, url: apiUrl.substring(0, 100) + '...' })

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ProteinMatch/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Yahoo! API エラー: ${response.status}`)
    }

    const data = await response.json()
    
    console.log('📊 Yahoo! API応答:', {
      totalResultsAvailable: data.totalResultsAvailable,
      totalResultsReturned: data.totalResultsReturned,
      itemsLength: data.hits?.length || 0
    })

    if (!data.hits || data.hits.length === 0) {
      console.log('⚠️ Yahoo!で商品が見つかりませんでした')
      return []
    }

    // Yahoo!の商品データを統一形式に変換
    const processedProducts = data.hits
      .map((hit: any) => processYahooProduct(hit))
      .filter((product: YahooProduct | null) => product && isValidYahooProduct(product))
      .slice(0, 10)

    console.log(`✅ Yahoo!: ${data.hits.length}件中、${processedProducts.length}件が適合`)
    return processedProducts as YahooProduct[]

  } catch (error: any) {
    console.error('❌ Yahoo!ショッピングAPI検索エラー:', error)
    // エラー時はダミーデータを返す
    return generateYahooDummyProducts(query)
  }
}

// Yahoo!商品データを統一形式に変換
function processYahooProduct(hit: any): YahooProduct | null {
  try {
    const item = hit
    
    if (!item.name) {
      return null
    }

    const itemName = item.name || ''
    const description = item.description || item.caption || ''
    const price = parseInt(item.price) || 0
    
    // 栄養成分を推定
    const nutrition = estimateNutritionFromYahoo(description, itemName)
    const servings = estimateServingsFromName(itemName)
    const pricePerServing = Math.round(price / servings)

    return {
      id: `yahoo_${item.code || Date.now()}`,
      name: itemName,
      brand: extractBrandFromName(itemName),
      imageUrl: item.image?.medium || item.image?.small || '',
      price: price,
      pricePerServing: pricePerServing,
      description: description.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
      shopName: item.seller?.name || 'Yahoo!ショッピング',
      affiliateUrl: item.url || '',
      reviewAverage: parseFloat(item.review?.rate || '0') || 0,
      reviewCount: parseInt(item.review?.count || '0') || 0,
      nutrition: nutrition,
      type: determineProductType(itemName),
      flavor: extractFlavorFromName(itemName),
      category: 'yahoo'
    }
  } catch (error) {
    console.error('Yahoo!商品処理エラー:', error)
    return null
  }
}

// Yahoo!商品が有効なプロテイン商品かチェック
function isValidYahooProduct(product: YahooProduct): boolean {
  const name = product.name.toLowerCase()
  
  // プロテイン商品の必須キーワード
  const proteinKeywords = ['プロテイン', 'protein', 'ホエイ', 'whey', 'ソイ', 'soy', 'カゼイン', 'casein']
  const hasProteinKeyword = proteinKeywords.some(keyword => name.includes(keyword.toLowerCase()))
  
  // 除外キーワード
  const excludeKeywords = ['シェイカー', 'ボトル', '計量', 'スプーン', 'サプリ']
  const hasExcludeKeyword = excludeKeywords.some(keyword => name.includes(keyword))
  
  // タンパク質含有量チェック
  const hasAdequateProtein = product.nutrition.protein >= 10
  
  // 価格チェック
  const reasonablePrice = product.pricePerServing >= 30 && product.pricePerServing <= 500
  
  return hasProteinKeyword && !hasExcludeKeyword && hasAdequateProtein && reasonablePrice
}

// 栄養成分推定（Yahoo!用）
function estimateNutritionFromYahoo(description: string, itemName: string) {
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

// ヘルパー関数群（楽天APIと同様）
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
  if (itemName.includes('コーヒー') || itemName.includes('カフェオレ')) return 'コーヒー'
  if (itemName.includes('抹茶')) return '抹茶'
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

// Yahoo! APIが使えない場合のダミーデータ生成
function generateYahooDummyProducts(query: string): YahooProduct[] {
  const dummyProducts: YahooProduct[] = [
    {
      id: 'yahoo_dummy_1',
      name: 'Yahoo!限定 ホエイプロテイン チョコレート味 1kg',
      brand: 'Yahoo!プロテイン',
      imageUrl: '',
      price: 4580,
      pricePerServing: 137,
      description: 'Yahoo!ショッピング限定のホエイプロテイン。高品質な原料を使用し、美味しいチョコレート味に仕上げました。',
      shopName: 'Yahoo!プロテイン公式店',
      affiliateUrl: '#yahoo-affiliate-link-1',
      reviewAverage: 4.3,
      reviewCount: 892,
      nutrition: {
        protein: 21,
        calories: 118,
        servings: 33,
        servingSize: 30
      },
      type: 'ホエイ',
      flavor: 'チョコレート',
      category: 'yahoo'
    },
    {
      id: 'yahoo_dummy_2', 
      name: 'Yahoo!セレクト ソイプロテイン ストロベリー味 800g',
      brand: 'Yahoo!プロテイン',
      imageUrl: '',
      price: 3980,
      pricePerServing: 149,
      description: 'Yahoo!ショッピングセレクト商品。植物性ソイプロテインでヘルシー。女性にも人気のストロベリー味。',
      shopName: 'Yahoo!ヘルス＆ビューティー',
      affiliateUrl: '#yahoo-affiliate-link-2',
      reviewAverage: 4.1,
      reviewCount: 456,
      nutrition: {
        protein: 18,
        calories: 105,
        servings: 27,
        servingSize: 30
      },
      type: 'ソイ',
      flavor: 'ストロベリー',
      category: 'yahoo'
    }
  ]
  
  console.log(`📦 Yahoo! ダミーデータを返します: ${dummyProducts.length}件`)
  return dummyProducts
}