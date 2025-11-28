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
      imageUrl: item.mediumImageUrls?.[0]?.imageUrl || item.smallImageUrls?.[0]?.imageUrl || '',
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

    // 診断APIと同じ検索方法を使用
    const wheyProducts = await searchRakutenProducts('プロテイン ホエイ', 4)
    const soyProducts = await searchRakutenProducts('プロテイン ソイ', 4)
    
    const allProducts = [...wheyProducts, ...soyProducts]

    const categories = [
      {
        category: 'whey',
        categoryName: 'ホエイプロテイン',
        products: wheyProducts
      },
      {
        category: 'soy', 
        categoryName: 'ソイプロテイン',
        products: soyProducts
      }
    ]

    console.log(`✅ 楽天APIから${allProducts.length}件の商品を取得`)
    console.log('🖼️ 画像URL確認:', allProducts[0]?.imageUrl)

    return NextResponse.json({
      success: true,
      categories,
      totalProducts: allProducts.length,
      source: 'rakuten-live'
    })

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