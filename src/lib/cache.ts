import fs from 'fs/promises'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), 'cache')
const FEATURED_PRODUCTS_CACHE = path.join(CACHE_DIR, 'featured-products.json')

// キャッシュディレクトリが存在しない場合は作成
export async function ensureCacheDir() {
  try {
    await fs.access(CACHE_DIR)
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true })
  }
}

// キャッシュファイルに商品データを保存
export async function saveFeaturedProductsCache(data: any) {
  await ensureCacheDir()
  await fs.writeFile(FEATURED_PRODUCTS_CACHE, JSON.stringify(data, null, 2), 'utf8')
  console.log('✅ 人気商品キャッシュを保存しました:', new Date().toLocaleString('ja-JP'))
}

// キャッシュファイルから商品データを読み込み
export async function loadFeaturedProductsCache() {
  try {
    const data = await fs.readFile(FEATURED_PRODUCTS_CACHE, 'utf8')
    const parsed = JSON.parse(data)
    console.log('✅ 人気商品キャッシュを読み込みました:', new Date().toLocaleString('ja-JP'))
    return parsed
  } catch (error) {
    console.log('⚠️ キャッシュファイルが見つかりません。初回取得します。')
    return null
  }
}

// キャッシュの有効性をチェック（24時間以内かどうか）
export async function isCacheValid() {
  try {
    const stats = await fs.stat(FEATURED_PRODUCTS_CACHE)
    const cacheAge = Date.now() - stats.mtime.getTime()
    const maxAge = 24 * 60 * 60 * 1000 // 24時間
    return cacheAge < maxAge
  } catch {
    return false
  }
}