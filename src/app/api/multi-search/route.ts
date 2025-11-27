import { NextRequest, NextResponse } from 'next/server'

interface SearchFilters {
  goal: string
  exercise: string
  about: string
  timing: string
  flavor: string
}

interface ProductResult {
  source: 'rakuten' | 'amazon' | 'yahoo'
  products: any[]
  totalFound: number
  searchQuery: string
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

  console.log('マルチAPI検索開始:', filters)

  try {
    // 各APIを並列で検索
    const searchPromises = [
      searchRakuten(filters),
      searchAmazon(filters),
      searchYahoo(filters)
    ]

    const results = await Promise.allSettled(searchPromises)
    
    const allProducts: any[] = []
    let totalFound = 0
    const sources: string[] = []

    // 各API結果を処理
    results.forEach((result, index) => {
      const sourceName = ['rakuten', 'amazon', 'yahoo'][index]
      
      if (result.status === 'fulfilled' && result.value.success) {
        allProducts.push(...result.value.products.map((p: any) => ({ ...p, source: sourceName })))
        totalFound += result.value.totalFound
        sources.push(sourceName)
        console.log(`${sourceName}: ${result.value.products.length}件取得`)
      } else {
        console.log(`${sourceName}: 検索失敗 -`, result.status === 'rejected' ? result.reason : result.value.error)
      }
    })

    // 統合スコアリング・重複排除・ランキング
    const finalProducts = processAllProducts(allProducts, filters)

    return NextResponse.json({
      success: true,
      products: finalProducts.slice(0, 15), // トップ15
      totalFound,
      sources,
      searchQuery: generateSearchQuery(filters)
    })

  } catch (error: any) {
    console.error('マルチ検索エラー:', error)
    
    // フォールバック: 楽天のみで検索
    try {
      const rakutenResult = await searchRakuten(filters)
      if (rakutenResult.success) {
        return NextResponse.json({
          success: true,
          products: rakutenResult.products,
          totalFound: rakutenResult.totalFound,
          sources: ['rakuten'],
          searchQuery: rakutenResult.searchQuery,
          fallback: true
        })
      }
    } catch (fallbackError) {
      console.error('フォールバック検索も失敗:', fallbackError)
    }

    return NextResponse.json({
      success: false,
      error: '商品検索中にエラーが発生しました',
      details: error.message
    }, { status: 500 })
  }
}

// 楽天API検索
async function searchRakuten(filters: SearchFilters) {
  try {
    const searchQuery = generateSearchQuery(filters)
    const rakutenAppId = '1054552037945576340'
    
    const apiUrl = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?` +
      `applicationId=${rakutenAppId}&` +
      `keyword=${encodeURIComponent(searchQuery)}&` +
      `hits=20&` +
      `sort=reviewAverage&` +
      `formatVersion=2`

    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error(`楽天API エラー: ${response.status}`)

    const data = await response.json()
    if (!data.Items) {
      return { success: false, error: '楽天: 商品が見つかりませんでした' }
    }

    const products = data.Items
      .map((item: any) => processRakutenProduct(item.Item, filters))
      .filter((p: any) => filterProduct(p, filters))

    return {
      success: true,
      products,
      totalFound: data.count,
      searchQuery
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Amazon検索（将来実装）
async function searchAmazon(filters: SearchFilters) {
  try {
    // TODO: Amazon PA-API実装
    // 現在は空の結果を返す
    return {
      success: false,
      error: 'Amazon API: 未実装（審査申請中）'
    }

    /* 将来の実装例:
    const searchQuery = generateAmazonQuery(filters)
    const amazonResult = await fetch('/api/amazon-paapi', {
      method: 'POST',
      body: JSON.stringify({ query: searchQuery, filters })
    })
    
    const data = await amazonResult.json()
    return {
      success: true,
      products: data.products.map(p => processAmazonProduct(p, filters)),
      totalFound: data.totalFound,
      searchQuery
    }
    */
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Yahoo!ショッピング検索（将来実装）
async function searchYahoo(filters: SearchFilters) {
  try {
    // TODO: Yahoo!ショッピングAPI実装
    return {
      success: false,
      error: 'Yahoo API: 未実装（申請準備中）'
    }

    /* 将来の実装例:
    const searchQuery = generateYahooQuery(filters)
    const yahooResult = await fetch('/api/yahoo-shopping', {
      method: 'POST', 
      body: JSON.stringify({ query: searchQuery, filters })
    })
    
    const data = await yahooResult.json()
    return {
      success: true,
      products: data.products.map(p => processYahooProduct(p, filters)),
      totalFound: data.totalFound,
      searchQuery
    }
    */
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 全商品を統合処理
function processAllProducts(allProducts: any[], filters: SearchFilters) {
  // 重複排除（商品名の類似性チェック）
  const uniqueProducts = removeDuplicates(allProducts)
  
  // 統合スコアリング
  const scoredProducts = uniqueProducts.map(product => ({
    ...product,
    totalScore: calculateUniversalScore(product, filters)
  }))

  // ソート（スコア順）
  return scoredProducts.sort((a, b) => b.totalScore - a.totalScore)
}

// 重複商品を除去
function removeDuplicates(products: any[]) {
  const seen = new Map()
  const unique: any[] = []

  for (const product of products) {
    // 商品名を正規化してキーとする
    const normalizedName = product.name
      .replace(/[\s\-_()（）【】]/g, '')
      .toLowerCase()
    
    // 同じ商品名が存在する場合、より詳細な情報を持つ方を残す
    if (seen.has(normalizedName)) {
      const existing = seen.get(normalizedName)
      if (product.reviewCount > existing.reviewCount) {
        // より多くのレビューがある商品を選択
        const index = unique.findIndex(p => p.id === existing.id)
        unique[index] = product
        seen.set(normalizedName, product)
      }
    } else {
      seen.set(normalizedName, product)
      unique.push(product)
    }
  }

  return unique
}

// 統合スコアリング
function calculateUniversalScore(product: any, filters: SearchFilters): number {
  let score = 0

  // レビュー評価（40点）
  score += (product.reviewAverage || 0) * 8

  // レビュー数（20点）
  const reviewScore = Math.min((product.reviewCount || 0) / 50, 20)
  score += reviewScore

  // 価格適正性（30点）
  const budget = determineBudget(filters)
  if (product.pricePerServing <= budget * 0.8) score += 30
  else if (product.pricePerServing <= budget) score += 25
  else if (product.pricePerServing <= budget * 1.2) score += 15

  // ソース信頼性（10点）
  const sourceScore = { rakuten: 10, amazon: 8, yahoo: 6 }
  score += sourceScore[product.source as keyof typeof sourceScore] || 5

  return score
}

// 共通のヘルパー関数
function generateSearchQuery(filters: SearchFilters): string {
  let query = 'プロテイン'
  
  if (filters.about === 'plant') query += ' ソイ'
  else query += ' ホエイ'
  
  if (filters.flavor === 'chocolate') query += ' チョコ'
  else if (filters.flavor === 'fruit') query += ' ストロベリー'
  
  return query
}

function determineBudget(filters: SearchFilters): number {
  if (filters.about === 'budget') return 80
  if (filters.goal === 'beauty') return 150
  return 100
}

function processRakutenProduct(product: any, filters: SearchFilters) {
  // 楽天商品処理ロジック（既存コードから移行）
  const itemName = product.itemName || ''
  const description = product.itemCaption || ''
  const price = parseInt(product.itemPrice) || 0
  
  const nutrition = extractNutrition(description, itemName)
  const pricePerServing = Math.round(price / (nutrition.servings || 30))
  
  return {
    id: `rakuten_${product.itemCode}`,
    name: itemName,
    brand: extractBrand(itemName),
    price: price,
    pricePerServing: pricePerServing,
    imageUrl: product.mediumImageUrls?.[0]?.imageUrl || '',
    shopName: product.shopName || '',
    reviewAverage: parseFloat(product.reviewAverage) || 0,
    reviewCount: product.reviewCount || 0,
    description: description.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
    affiliateUrl: product.affiliateUrl || product.itemUrl,
    itemUrl: product.itemUrl,
    nutrition: nutrition,
    type: determineProductType(itemName),
    flavor: extractFlavor(itemName),
    source: 'rakuten'
  }
}

function filterProduct(product: any, filters: SearchFilters): boolean {
  const budget = determineBudget(filters)
  if (product.pricePerServing > budget * 1.5) return false
  if (product.nutrition.protein < 10) return false
  return isProteinProduct(product.name)
}

// 栄養成分抽出などの既存ヘルパー関数
function extractNutrition(description: string, itemName: string) {
  const proteinMatch = description.match(/たんぱく質[\s：]*(\d+(?:\.\d+)?)g/i)
  return {
    protein: proteinMatch ? parseFloat(proteinMatch[1]) : 20,
    calories: 110,
    servings: 30,
    servingSize: 30
  }
}

function extractBrand(itemName: string): string {
  const brands = ['ザバス', 'DNS', 'ビーレジェンド', 'マイプロテイン']
  for (const brand of brands) {
    if (itemName.includes(brand)) return brand
  }
  return 'その他'
}

function extractFlavor(itemName: string): string {
  if (itemName.includes('チョコ')) return 'チョコレート'
  if (itemName.includes('ストロベリー')) return 'ストロベリー'
  return 'プレーン'
}

function determineProductType(itemName: string): string {
  if (itemName.includes('ソイ')) return 'ソイ'
  return 'ホエイ'
}

function isProteinProduct(itemName: string): boolean {
  const proteinKeywords = ['プロテイン', 'PROTEIN', 'ホエイ', 'ソイ']
  return proteinKeywords.some(keyword => itemName.toUpperCase().includes(keyword.toUpperCase()))
}