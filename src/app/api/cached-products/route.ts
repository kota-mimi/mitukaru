import { NextResponse } from 'next/server'
import { loadFeaturedProductsCache } from '@/lib/cache'

// フォールバック用のダミーデータ（本番環境で問題が発生した場合）
const fallbackProducts = [
  {
    id: 'fallback_001',
    name: 'ザバス ホエイプロテイン100 リッチショコラ味 980g',
    description: 'ホエイプロテイン100%使用。アスリートのカラダづくりをサポート。',
    image: '/placeholder-protein.svg',
    category: 'WHEY',
    rating: 4.5,
    reviews: 1000,
    tags: ['フォールバック', '緊急用'],
    price: 4500,
    protein: 20,
    calories: 110,
    servings: 30,
    shops: [{ name: 'Rakuten' as const, price: 4500, url: '#' }]
  }
]

// キャッシュされた商品データを返すAPI（フロントエンド用）
export async function GET() {
  try {
    console.log('📖 キャッシュデータ読み込み開始')
    
    // キャッシュからデータを取得
    const cacheData = await loadFeaturedProductsCache()
    
    if (!cacheData) {
      console.log('⚠️ キャッシュデータが見つかりません - フォールバックデータを使用')
      return NextResponse.json({
        success: true,
        products: fallbackProducts,
        totalCount: fallbackProducts.length,
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
        message: 'キャッシュ未初期化 - フォールバックデータを表示中'
      })
    }

    // キャッシュデータを統一形式に変換
    let products: any[] = []
    
    if (cacheData.categories && Array.isArray(cacheData.categories)) {
      // 全カテゴリの商品をフラットに展開
      products = cacheData.categories.flatMap((category: any) => {
        if (category.products && Array.isArray(category.products)) {
          return category.products.map((product: any) => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            image: product.imageUrl || '/placeholder-protein.svg',
            category: mapCategoryToStandard(product.category || 'WHEY'),
            rating: product.reviewAverage || 0,
            reviews: product.reviewCount || 0,
            tags: ['楽天', 'キャッシュ'],
            price: product.price || 0,
            protein: product.nutrition?.protein || 20,
            calories: product.nutrition?.calories || 110,
            servings: product.nutrition?.servings || 30,
            shops: [{
              name: 'Rakuten' as const,
              price: product.price || 0,
              url: product.affiliateUrl || '#'
            }]
          }))
        }
        return []
      })
    }
    
    console.log(`✅ キャッシュから${products.length}件の商品を取得`)
    
    return NextResponse.json({
      success: true,
      products: products,
      totalCount: products.length,
      lastUpdated: cacheData.lastUpdated,
      source: 'cache',
      message: `キャッシュから${products.length}件取得`
    })

  } catch (error: any) {
    console.error('❌ キャッシュデータ読み込みエラー:', error)
    return NextResponse.json({
      success: false,
      error: 'キャッシュデータの読み込みに失敗しました',
      details: error.message
    }, { status: 500 })
  }
}

// カテゴリ名を標準形式にマッピング
function mapCategoryToStandard(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'whey': 'WHEY',
    'soy': 'VEGAN',
    'casein': 'CASEIN',
    'wpi': 'WHEY',
    'all_protein': 'WHEY',
    'popular_protein': 'WHEY',
    'recommended_protein': 'WHEY',
    'savas': 'WHEY',
    'dns': 'WHEY',
    'belegend': 'WHEY',
    'myprotein': 'WHEY',
    'alpron': 'WHEY',
    'xplosion': 'WHEY',
    'valx': 'WHEY',
    'goldsgym': 'WHEY',
    'diet': 'VEGAN',
    'muscle': 'WHEY',
    'beauty': 'VEGAN',
    'plant': 'VEGAN'
  }
  
  return categoryMap[category] || 'WHEY'
}