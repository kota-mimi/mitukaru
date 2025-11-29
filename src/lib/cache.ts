import fs from 'fs'
import path from 'path'

const CACHE_KEY = 'featured-products'
const CACHE_TIMESTAMP_KEY = 'featured-products-timestamp'
const CACHE_DIR = path.join(process.cwd(), 'cache')
const CACHE_FILE = path.join(CACHE_DIR, 'products.json')

// 開発環境用ファイルベース・本番環境用Vercel KVのハイブリッド対応
export async function saveFeaturedProductsCache(data: any) {
  try {
    // 本番環境ではVercel KV使用
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      await kv.set(CACHE_KEY, JSON.stringify(data))
      await kv.set(CACHE_TIMESTAMP_KEY, Date.now())
      console.log('✅ 人気商品キャッシュを保存しました (Vercel KV):', new Date().toLocaleString('ja-JP'))
    } else {
      // 開発環境ではファイルベース
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true })
      }
      const cacheData = {
        data: data,
        timestamp: Date.now()
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2))
      console.log('✅ 人気商品キャッシュを保存しました (開発環境・ファイル):', new Date().toLocaleString('ja-JP'))
    }
  } catch (error) {
    console.error('❌ キャッシュ保存エラー:', error)
    throw error
  }
}

// 商品データを読み込み（ハイブリッド対応）
export async function loadFeaturedProductsCache() {
  try {
    // 本番環境ではVercel KV使用
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      const data = await kv.get(CACHE_KEY)
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        console.log('✅ 人気商品キャッシュを読み込みました (Vercel KV):', new Date().toLocaleString('ja-JP'))
        return parsed
      }
    } else {
      // 開発環境ではファイルベース
      if (fs.existsSync(CACHE_FILE)) {
        const fileContent = fs.readFileSync(CACHE_FILE, 'utf8')
        const cacheData = JSON.parse(fileContent)
        console.log('✅ 人気商品キャッシュを読み込みました (開発環境・ファイル):', new Date().toLocaleString('ja-JP'))
        return cacheData.data
      }
    }
    return null
  } catch (error) {
    console.log('⚠️ キャッシュが見つかりません。初回取得します。')
    return null
  }
}

// キャッシュの有効性をチェック（24時間以内かどうか・ハイブリッド対応）
export async function isCacheValid() {
  try {
    let timestamp = null
    
    // 本番環境ではVercel KV使用
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      timestamp = await kv.get(CACHE_TIMESTAMP_KEY)
    } else {
      // 開発環境ではファイルベース
      if (fs.existsSync(CACHE_FILE)) {
        const fileContent = fs.readFileSync(CACHE_FILE, 'utf8')
        const cacheData = JSON.parse(fileContent)
        timestamp = cacheData.timestamp
      }
    }
    
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