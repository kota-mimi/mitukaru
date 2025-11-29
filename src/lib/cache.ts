import { kv } from '@vercel/kv'

const CACHE_KEY = 'featured-products'
const CACHE_TIMESTAMP_KEY = 'featured-products-timestamp'

// Vercel KVに商品データを保存
export async function saveFeaturedProductsCache(data: any) {
  try {
    await kv.set(CACHE_KEY, JSON.stringify(data))
    await kv.set(CACHE_TIMESTAMP_KEY, Date.now())
    console.log('✅ 人気商品キャッシュを保存しました (Vercel KV):', new Date().toLocaleString('ja-JP'))
  } catch (error) {
    console.error('❌ キャッシュ保存エラー:', error)
    throw error
  }
}

// Vercel KVから商品データを読み込み
export async function loadFeaturedProductsCache() {
  try {
    const data = await kv.get(CACHE_KEY)
    if (data) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      console.log('✅ 人気商品キャッシュを読み込みました (Vercel KV):', new Date().toLocaleString('ja-JP'))
      return parsed
    }
    return null
  } catch (error) {
    console.log('⚠️ キャッシュが見つかりません。初回取得します。')
    return null
  }
}

// キャッシュの有効性をチェック（24時間以内かどうか）
export async function isCacheValid() {
  try {
    const timestamp = await kv.get(CACHE_TIMESTAMP_KEY)
    if (timestamp) {
      const cacheAge = Date.now() - Number(timestamp)
      const maxAge = 24 * 60 * 60 * 1000 // 24時間
      return cacheAge < maxAge
    }
    return false
  } catch {
    return false
  }
}