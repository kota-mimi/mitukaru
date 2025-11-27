import { NextResponse } from 'next/server'
import { loadFeaturedProductsCache, isCacheValid } from '@/lib/cache'

export async function GET() {
  try {
    // キャッシュから商品データを読み込み
    console.log('📦 キャッシュから人気商品を読み込み中...')
    const cachedData = await loadFeaturedProductsCache()
    
    if (cachedData) {
      console.log('✅ キャッシュデータを返します（APIコストなし！）')
      return NextResponse.json({
        ...cachedData,
        source: 'cache',
        info: '朝8時に自動更新されたデータです'
      })
    }

    // キャッシュがない場合は初回用のダミーデータを返す
    console.log('⚠️ キャッシュが見つかりません。初期データを返します。')
    return NextResponse.json({
      success: true,
      categories: [
        {
          category: 'whey',
          categoryName: '人気ホエイプロテイン', 
          products: []
        },
        {
          category: 'soy',
          categoryName: '売れ筋ソイプロテイン',
          products: []
        },
        {
          category: 'budget', 
          categoryName: 'コスパ最強',
          products: []
        },
        {
          category: 'premium',
          categoryName: '高評価商品', 
          products: []
        }
      ],
      totalCategories: 4,
      source: 'initial',
      message: '朝8時の自動更新をお待ちください'
    })

  } catch (error: any) {
    console.error('キャッシュ読み込みエラー:', error)
    return NextResponse.json({
      success: false,
      error: 'キャッシュ読み込み中にエラーが発生しました',
      details: error.message,
      source: 'error'
    }, { status: 500 })
  }
}