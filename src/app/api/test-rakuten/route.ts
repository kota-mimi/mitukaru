import { NextRequest, NextResponse } from 'next/server'

// テスト用のモックデータ
const mockProducts = [
  {
    id: "test-001",
    name: "ザバス ホエイプロテイン100 ココア味 1050g",
    brand: "SAVAS",
    price: 5980,
    pricePerServing: 68,
    imageUrl: "https://m.media-amazon.com/images/I/71rKqLyq7OL._AC_SL1500_.jpg",
    shopName: "楽天テストショップ",
    reviewCount: 1250,
    reviewAverage: 4.3,
    description: "国産の定番ホエイプロテイン。溶けやすく、ココア味で飲みやすい。",
    url: "https://example.com/savas-whey-cocoa",
    affiliateUrl: "https://example.com/savas-whey-cocoa",
    type: ["ホエイ"],
    features: {
      protein: 20,
      calories: 113,
      servings: 50
    },
    tags: ["筋トレ", "国産"]
  },
  {
    id: "test-002",
    name: "ビーレジェンド ホエイプロテイン 南国パイン風味 1kg",
    brand: "beLEGEND",
    price: 3980,
    pricePerServing: 60,
    imageUrl: "https://m.media-amazon.com/images/I/61F5FiQnKoL._AC_SL1500_.jpg",
    shopName: "楽天テストショップ2",
    reviewCount: 890,
    reviewAverage: 4.5,
    description: "フルーティーで飲みやすい。コスパが良く、溶けやすさも抜群。",
    url: "https://example.com/belegend-pineapple",
    affiliateUrl: "https://example.com/belegend-pineapple",
    type: ["ホエイ"],
    features: {
      protein: 21,
      calories: 118,
      servings: 33
    },
    tags: ["コスパ重視", "フルーツ系"]
  },
  {
    id: "test-003",
    name: "マイプロテイン インパクトホエイ チョコレート 2.5kg",
    brand: "Myprotein",
    price: 7980,
    pricePerServing: 45,
    imageUrl: "https://m.media-amazon.com/images/I/61yN5qGhOhL._AC_SL1500_.jpg",
    shopName: "マイプロテイン公式",
    reviewCount: 2150,
    reviewAverage: 4.2,
    description: "海外ブランドの高コスパプロテイン。甘いチョコレート味。",
    url: "https://example.com/myprotein-chocolate",
    affiliateUrl: "https://example.com/myprotein-chocolate",
    type: ["ホエイ"],
    features: {
      protein: 21,
      calories: 103,
      servings: 100
    },
    tags: ["コスパ重視", "海外ブランド"]
  },
  {
    id: "test-004",
    name: "ザバス ソイプロテイン100 ココア味 945g",
    brand: "SAVAS",
    price: 4480,
    pricePerServing: 60,
    imageUrl: "https://m.media-amazon.com/images/I/71P5mNrczIL._AC_SL1500_.jpg",
    shopName: "楽天テストショップ",
    reviewCount: 680,
    reviewAverage: 4.1,
    description: "大豆由来で乳糖フリー。腹持ちが良く、美容成分配合で女性におすすめ。",
    url: "https://example.com/savas-soy-cocoa",
    affiliateUrl: "https://example.com/savas-soy-cocoa",
    type: ["ソイ", "植物性"],
    features: {
      protein: 15,
      calories: 79,
      servings: 45
    },
    tags: ["美容", "女性向け", "植物性"]
  },
  {
    id: "test-005",
    name: "GOLD'S GYM CFMホエイプロテイン チョコレート 2kg",
    brand: "Gold's Gym",
    price: 15800,
    pricePerServing: 110,
    imageUrl: "https://m.media-amazon.com/images/I/61XqN8qGPpL._AC_SL1500_.jpg",
    shopName: "ゴールドジム公式",
    reviewCount: 420,
    reviewAverage: 4.7,
    description: "高品質WPI使用。乳糖を除去済みで、本格的な筋トレユーザー向け。",
    url: "https://example.com/golds-gym-cfm",
    affiliateUrl: "https://example.com/golds-gym-cfm",
    type: ["ホエイ", "WPI"],
    features: {
      protein: 24,
      calories: 108,
      servings: 72
    },
    tags: ["本格", "高品質", "上級者向け"]
  }
]

export async function GET(request: NextRequest) {
  try {
    // 短い遅延でリアルなAPI感を演出
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const response = {
      success: true,
      products: mockProducts,
      totalCount: mockProducts.length,
      page: 1,
      pageCount: 1,
      source: 'test-rakuten'
    }

    console.log('テスト用楽天API: 商品データ送信', response.products.length, '件')
    
    return NextResponse.json(response)

  } catch (error: any) {
    console.error('テスト用楽天API エラー:', error)
    return NextResponse.json({ 
      error: 'テストAPI実行中にエラーが発生しました',
      details: error.message 
    }, { status: 500 })
  }
}