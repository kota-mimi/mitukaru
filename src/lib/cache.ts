// Server-side only imports
const fs = typeof window === 'undefined' ? require('fs') : null
const path = typeof window === 'undefined' ? require('path') : null

const CACHE_KEY = 'featured-products'
const CACHE_TIMESTAMP_KEY = 'featured-products-timestamp'
const CACHE_DIR = typeof window === 'undefined' ? path.join(process.cwd(), 'cache') : ''
const CACHE_FILE = typeof window === 'undefined' ? path.join(CACHE_DIR, 'products.json') : ''

// 開発環境用ファイルベース・本番環境用Vercel KVのハイブリッド対応
export async function saveFeaturedProductsCache(data: any) {
  try {
    // 本番環境ではVercel KV使用
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv')
        await kv.set(CACHE_KEY, JSON.stringify(data))
        await kv.set(CACHE_TIMESTAMP_KEY, Date.now())
        console.log('✅ 人気商品キャッシュを保存しました (Vercel KV):', new Date().toLocaleString('ja-JP'))
        return
      } catch (kvError) {
        console.warn('⚠️ Vercel KV保存失敗、メモリキャッシュを使用:', kvError)
        // KVが失敗した場合、メモリキャッシュとして保存
        global.memoryCache = data
        global.memoryCacheTimestamp = Date.now()
        console.log('✅ 人気商品キャッシュを保存しました (メモリ):', new Date().toLocaleString('ja-JP'))
        return
      }
    }
    
    // 開発環境ではファイルベース
    if (typeof window === 'undefined' && fs && path) {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true })
      }
      const cacheData = {
        data: data,
        timestamp: Date.now()
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2))
      console.log('✅ 人気商品キャッシュを保存しました (開発環境・ファイル):', new Date().toLocaleString('ja-JP'))
    } else {
      // 最終手段：メモリキャッシュ
      global.memoryCache = data
      global.memoryCacheTimestamp = Date.now()
      console.log('✅ 人気商品キャッシュを保存しました (メモリフォールバック):', new Date().toLocaleString('ja-JP'))
    }
  } catch (error) {
    console.error('❌ キャッシュ保存エラー:', error)
    // エラーでも最低限メモリに保存
    try {
      global.memoryCache = data
      global.memoryCacheTimestamp = Date.now()
      console.log('✅ エラー時メモリキャッシュに保存:', new Date().toLocaleString('ja-JP'))
    } catch (memError) {
      console.error('❌ メモリキャッシュ保存も失敗:', memError)
      throw error
    }
  }
}

// 商品データを読み込み（ハイブリッド対応）
export async function getFeaturedProductsCache() {
  return await loadFeaturedProductsCache()
}

// 商品データを読み込み（ハイブリッド対応）
export async function loadFeaturedProductsCache() {
  try {
    // 本番環境ではVercel KV使用
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv')
        const data = await kv.get(CACHE_KEY)
        if (data) {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data
          console.log('✅ 人気商品キャッシュを読み込みました (Vercel KV):', new Date().toLocaleString('ja-JP'))
          return parsed
        }
      } catch (kvError) {
        console.warn('⚠️ Vercel KV読み込み失敗、メモリキャッシュを確認:', kvError)
      }
    }
    
    // メモリキャッシュを確認
    if (global.memoryCache) {
      console.log('✅ 人気商品キャッシュを読み込みました (メモリ):', new Date().toLocaleString('ja-JP'))
      return global.memoryCache
    }
    
    // 開発環境ではファイルベース
    if (typeof window === 'undefined' && fs && path && fs.existsSync(CACHE_FILE)) {
      const fileContent = fs.readFileSync(CACHE_FILE, 'utf8')
      const cacheData = JSON.parse(fileContent)
      console.log('✅ 人気商品キャッシュを読み込みました (開発環境・ファイル):', new Date().toLocaleString('ja-JP'))
      return cacheData.data
    }
    
    return null
  } catch (error) {
    console.log('⚠️ キャッシュが見つかりません。初回取得します。')
    // メモリキャッシュも確認
    if (global.memoryCache) {
      console.log('✅ エラー時メモリキャッシュから読み込み:', new Date().toLocaleString('ja-JP'))
      return global.memoryCache
    }
    return null
  }
}

// キャッシュの有効性をチェック（24時間以内かどうか・ハイブリッド対応）
export async function isCacheValid() {
  try {
    let timestamp = null
    
    // 本番環境ではVercel KV使用
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv')
        timestamp = await kv.get(CACHE_TIMESTAMP_KEY)
      } catch (kvError) {
        console.warn('⚠️ Vercel KV timestamp取得失敗、メモリキャッシュを確認:', kvError)
        // KVが失敗した場合、メモリキャッシュのタイムスタンプを確認
        timestamp = global.memoryCacheTimestamp
      }
    } else {
      // 開発環境ではファイルベース
      if (typeof window === 'undefined' && fs && path && fs.existsSync(CACHE_FILE)) {
        const fileContent = fs.readFileSync(CACHE_FILE, 'utf8')
        const cacheData = JSON.parse(fileContent)
        timestamp = cacheData.timestamp
      } else {
        // ファイルがない場合、メモリキャッシュのタイムスタンプを確認
        timestamp = global.memoryCacheTimestamp
      }
    }
    
    if (timestamp) {
      const cacheAge = Date.now() - Number(timestamp)
      const maxAge = 24 * 60 * 60 * 1000 // 24時間
      return cacheAge < maxAge
    }
    return false
  } catch {
    // エラーの場合、メモリキャッシュのタイムスタンプで最終確認
    if (global.memoryCacheTimestamp) {
      const cacheAge = Date.now() - Number(global.memoryCacheTimestamp)
      const maxAge = 24 * 60 * 60 * 1000
      return cacheAge < maxAge
    }
    return false
  }
}