import { NextRequest, NextResponse } from 'next/server'

// 楽天API 直接テスト
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const appId = searchParams.get('appId') || '1054552037945576340'
  
  // 最もシンプルな楽天API呼び出しでテスト
  const testUrls = [
    // パターン1: 最新の楽天商品検索API
    `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${appId}&keyword=プロテイン&hits=30&formatVersion=2`,
    
    // パターン2: 古いバージョン
    `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20140222?applicationId=${appId}&keyword=プロテイン&hits=5`,
    
    // パターン3: 最新のエンドポイント
    `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?applicationId=${appId}&keyword=プロテイン&hits=5&formatVersion=2`
  ]

  const results = []

  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i]
    try {
      console.log(`テスト ${i + 1}:`, url.replace(appId, 'APP_ID_HIDDEN'))
      
      const response = await fetch(url)
      const status = response.status
      const statusText = response.statusText
      
      if (response.ok) {
        const data = await response.json()
        results.push({
          pattern: i + 1,
          url: url.replace(appId, 'APP_ID_HIDDEN'),
          status: `${status} ${statusText}`,
          success: true,
          itemCount: data.Items?.length || data.count || 0,
          data: data.Items ? data.Items.slice(0, 2) : data // 最初の2件だけ
        })
      } else {
        const errorText = await response.text()
        results.push({
          pattern: i + 1,
          url: url.replace(appId, 'APP_ID_HIDDEN'),
          status: `${status} ${statusText}`,
          success: false,
          error: errorText.substring(0, 500)
        })
      }
    } catch (error: any) {
      results.push({
        pattern: i + 1,
        url: url.replace(appId, 'APP_ID_HIDDEN'),
        status: 'Network Error',
        success: false,
        error: error.message
      })
    }
  }

  // 成功した結果を管理画面用の形式で返す
  const successfulResult = results.find(result => result.success)
  
  if (successfulResult && successfulResult.data) {
    // 楽天商品データを管理画面形式に変換（フィルタリングなしで全件表示）
    const products = successfulResult.data.map((item: any) => {
      const product = item.Item || item
      
      return {
        id: product.itemCode || Math.random().toString(36),
        name: product.itemName,
        brand: product.itemName?.split(' ')[0] || 'ブランド不明',
        price: parseInt(product.itemPrice) || 0,
        pricePerServing: Math.round((parseInt(product.itemPrice) || 0) / 30),
        imageUrl: product.mediumImageUrls?.[0]?.imageUrl || product.smallImageUrls?.[0]?.imageUrl || '',
        shopName: product.shopName || 'ショップ不明',
        reviewCount: product.reviewCount || 0,
        reviewAverage: parseFloat(product.reviewAverage) || 0,
        description: (product.itemCaption || product.itemName || '').replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        url: product.itemUrl || '',
        affiliateUrl: product.affiliateUrl || product.itemUrl || '',
        tags: ['楽天', 'プロテイン'],
        type: ['ホエイ'],
        features: {
          protein: 20,
          calories: 110,
          servings: 30
        },
        source: 'rakuten',
        lastUpdated: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      products,
      totalCount: products.length,
      page: 1,
      pageCount: 1,
      source: 'rakuten-test'
    })
  } else {
    return NextResponse.json({
      success: false,
      error: '楽天API接続に失敗しました',
      results
    }, { status: 500 })
  }
}