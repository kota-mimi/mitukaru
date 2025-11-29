import { NextResponse } from 'next/server'
import { loadFeaturedProductsCache, isCacheValid } from '@/lib/cache'

// 商品データ取得API（クライアントサイド用）
export async function GET() {
  try {
    // まずキャッシュから読み込み
    const cachedData = await loadFeaturedProductsCache()
    const isValid = await isCacheValid()
    
    if (cachedData && isValid) {
      return NextResponse.json({
        success: true,
        categories: cachedData.categories || [],
        source: 'cache',
        lastUpdated: cachedData.lastUpdated
      })
    } else {
      // キャッシュが古い場合は楽天APIから直接取得
      console.log('⏰ キャッシュが古いため、楽天APIから取得中...')
      
      // update-cacheエンドポイントを内部的に呼び出し
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/update-cache?token=update-morning-8am`)
      const data = await response.json()
      
      if (data.success && data.categories) {
        return NextResponse.json({
          success: true,
          categories: data.categories,
          source: 'fresh',
          lastUpdated: new Date().toISOString()
        })
      } else {
        throw new Error('Failed to fetch fresh data')
      }
    }
  } catch (error: any) {
    console.error('❌ 商品データ取得エラー:', error)
    
    // エラー時はダミーデータまたは空データを返す
    return NextResponse.json({
      success: false,
      categories: [],
      error: error.message,
      source: 'error'
    }, { status: 500 })
  }
}