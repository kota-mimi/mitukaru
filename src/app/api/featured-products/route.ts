import { NextResponse } from 'next/server'

async function searchRakutenProducts(query: string, hits: number = 5) {
  const rakutenAppId = process.env.RAKUTEN_APP_ID
  if (!rakutenAppId) {
    throw new Error('RAKUTEN_APP_ID environment variable is not set')
  }

  const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${rakutenAppId}&keyword=${encodeURIComponent(query)}&hits=${hits}&page=1&sort=standard&formatVersion=2`
  
  console.log(`楽天API呼び出し: ${query}`)
  const response = await fetch(url)
  const data = await response.json()
  
  console.log(`楽天API応答 ${query}:`, { hasItems: !!data.Items, itemsLength: data.Items?.length })

  if (data.Items && data.Items.length > 0) {
    return data.Items.map((item: any) => ({
      id: item.itemCode || Math.random().toString(36).substr(2, 9),
      name: item.itemName,
      brand: item.shopName,
      // 診断結果と同じ画像URL抽出ロジック
      imageUrl: item.mediumImageUrls?.[0] || item.smallImageUrls?.[0] || '',
      reviewAverage: item.reviewAverage || 4.0,
      reviewCount: item.reviewCount || 0,
      description: item.catchcopy || '',
      nutrition: {
        protein: 20,
        calories: 100,
        servings: 30,
        servingSize: 25
      },
      type: query.includes('ホエイ') ? 'ホエイ' : query.includes('ソイ') ? 'ソイ' : 'プロテイン',
      flavor: 'ナチュラル',
      price: item.itemPrice || 0,
      pricePerServing: Math.round((item.itemPrice || 0) / 30),
      shopName: item.shopName,
      affiliateUrl: item.affiliateUrl || item.itemUrl,
      category: query.includes('ホエイ') ? 'whey' : query.includes('ソイ') ? 'soy' : 'general'
    }))
  }
  return []
}

export async function GET() {
  try {
    console.log('🔍 楽天APIから人気商品を取得中...')

    // シンプルな検索クエリで確実に商品を取得
    const searches = [
      { query: 'プロテイン', category: 'popular', hits: 12 }
    ]

    console.log('📊 複数クエリで楽天API検索開始...')
    const searchPromises = searches.map(search => 
      searchRakutenProducts(search.query, search.hits).then(products => ({
        category: search.category,
        products
      }))
    )

    const searchResults = await Promise.all(searchPromises)
    
    // 取得した商品を3つのカテゴリに分類
    const allProducts = searchResults.flatMap(result => result.products)
    
    // 12商品を4商品ずつ3カテゴリに分割
    const popularProducts = allProducts.slice(0, 4)  // 人気順上位
    const cospaProducts = allProducts.slice(4, 8)    // 中位をコスパ商品として
    const saleProducts = allProducts.slice(8, 12)    // 残りをセール商品として

    const categories = [
      {
        category: 'popular',
        categoryName: '🔥 人気のプロテイン',
        products: popularProducts
      },
      {
        category: 'cospa', 
        categoryName: '💰 コスパ重視',
        products: cospaProducts
      },
      {
        category: 'sale', 
        categoryName: '🎯 セール中',
        products: saleProducts
      }
    ]

    console.log(`✅ 楽天APIから${allProducts.length}件の商品を取得`)
    console.log('🖼️ 画像URL確認:', allProducts[0]?.imageUrl)

    const response = NextResponse.json({
      success: true,
      categories,
      totalProducts: allProducts.length,
      source: 'rakuten-live',
      timestamp: new Date().toISOString()
    })
    
    // キャッシュを無効化
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response

  } catch (error: any) {
    console.error('楽天API取得エラー:', error)
    return NextResponse.json({
      success: false,
      error: '楽天API取得中にエラーが発生しました',
      details: error.message,
      source: 'error'
    }, { status: 500 })
  }
}
