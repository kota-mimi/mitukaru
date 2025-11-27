'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface PlatformInfo {
  platform: 'rakuten' | 'amazon' | 'yahoo'
  price: number
  pricePerServing: number
  originalPrice?: number
  shopName: string
  affiliateUrl: string
  stock?: {
    status: string
    quantity: number
    lowStock: boolean
  }
  shipping?: {
    freeShipping: boolean
    deliveryDays: string
    shippingCost: number
  }
  sale?: {
    onSale: boolean
    discountRate: number
    saleEndTime: string | null
  }
}

interface Product {
  id: string
  name: string
  brand: string
  imageUrl: string
  reviewAverage: number
  reviewCount: number
  description: string
  nutrition: {
    protein: number
    calories: number
    servings: number
    servingSize: number
  }
  type: string
  flavor: string
  score?: number
  platforms: PlatformInfo[]  // 複数ECサイト対応
  bestPrice?: PlatformInfo   // 最安値情報
}

interface SearchResult {
  success: boolean
  products: Product[]
  totalFound: number
  searchQuery: string
  filters: any
}

// ヘルパー関数
function getPlatformName(platform: string): string {
  const names = {
    rakuten: '楽天',
    amazon: 'Amazon',
    yahoo: 'Yahoo!'
  }
  return names[platform as keyof typeof names] || platform
}

function getPlatformColor(platform: string): string {
  const colors = {
    rakuten: 'bg-red-500',
    amazon: 'bg-orange-500', 
    yahoo: 'bg-purple-500'
  }
  return colors[platform as keyof typeof colors] || 'bg-gray-500'
}

export default function ProteinResultsPage() {
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError('')

        const queryString = searchParams.toString()
        console.log('検索パラメータ:', queryString)

        const response = await fetch(`/api/protein-search?${queryString}`)
        const data = await response.json()

        console.log('API レスポンス:', data)

        if (data.success) {
          setResults(data)
        } else {
          setError(data.error || '検索に失敗しました')
        }
      } catch (err: any) {
        console.error('検索エラー:', err)
        setError('検索中にエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            あなたにピッタリのプロテインを探しています...
          </h2>
          <p className="text-gray-600">
            最新の商品情報を取得中です
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              検索でエラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/simple-diagnosis" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              診断をやり直す
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!results || !results.products.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              商品が見つかりませんでした
            </h2>
            <p className="text-gray-600 mb-6">
              検索条件を変更して、もう一度お試しください。
            </p>
            <Link 
              href="/simple-diagnosis" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              診断をやり直す
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              あなたにおすすめのプロテイン
            </h1>
            <p className="text-gray-600 mb-4">
              診断結果に基づいて、{results.products.length}個の最適な商品をご提案します
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                検索キーワード: {results.searchQuery}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                全{results.totalFound}件から厳選
              </span>
            </div>
          </div>
        </div>

        {/* 商品リスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.products.map((product, index) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* ランキングバッジ */}
              {index < 3 && (
                <div className={`absolute z-10 m-4 px-3 py-1 rounded-full text-white font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  {index === 0 ? '🥇 1位' : index === 1 ? '🥈 2位' : '🥉 3位'}
                </div>
              )}

              {/* セール・在庫バッジ */}
              <div className="absolute z-10 top-4 right-4 space-y-2">
                {product.sale?.onSale && (
                  <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {product.sale.discountRate}% OFF
                  </div>
                )}
                {product.stock?.lowStock && (
                  <div className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    残りわずか
                  </div>
                )}
              </div>

              {/* 商品画像 */}
              <div className="relative">
                <img
                  src={product.imageUrl || '/placeholder-protein.jpg'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </div>

              <div className="p-6">
                {/* ブランドとタイプ */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {product.brand}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {product.type}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {product.flavor}
                  </span>
                </div>

                {/* 商品名 */}
                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">
                  {product.name}
                </h3>

                {/* 最安価格表示 */}
                {product.bestPrice && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          ¥{product.bestPrice.pricePerServing}
                          <span className="text-sm font-normal text-gray-600">/食</span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span>本体価格: ¥{product.bestPrice.price.toLocaleString()}</span>
                          {product.bestPrice.originalPrice && product.bestPrice.originalPrice > product.bestPrice.price && (
                            <span className="line-through text-gray-400">
                              ¥{product.bestPrice.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        最安値: {getPlatformName(product.bestPrice.platform)}
                      </div>
                    </div>
                  </div>
                )}

                {/* 栄養情報 */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">タンパク質</div>
                    <div className="font-bold text-green-600">{product.nutrition.protein}g</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">カロリー</div>
                    <div className="font-bold">{product.nutrition.calories}kcal</div>
                  </div>
                </div>

                {/* ECサイト比較表示 */}
                {product.platforms && product.platforms.length > 1 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-semibold text-gray-700 mb-2">価格・在庫比較</div>
                    <div className="space-y-2">
                      {product.platforms.slice(0, 3).map((platform, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getPlatformColor(platform.platform)}`}></span>
                            <span>{getPlatformName(platform.platform)}</span>
                            {platform.sale?.onSale && (
                              <span className="text-red-600 text-xs font-bold">
                                {platform.sale.discountRate}%OFF
                              </span>
                            )}
                            {/* 在庫状況アイコン */}
                            {platform.stock && (
                              <span className={`text-xs ${
                                platform.stock.status === '在庫あり' ? 'text-green-600' : 
                                platform.stock.status === '残りわずか' ? 'text-orange-600' : 
                                'text-red-600'
                              }`}>
                                {platform.stock.status === '在庫あり' ? '✅' : 
                                 platform.stock.status === '残りわずか' ? '⚠️' : '❌'}
                                {platform.stock.status}
                                {platform.stock.lowStock && platform.stock.quantity > 0 && (
                                  <span className="ml-1">({platform.stock.quantity}個)</span>
                                )}
                              </span>
                            )}
                          </div>
                          <span className="font-medium">
                            ¥{platform.pricePerServing}/食
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                {/* レビュー */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-2">
                    {'⭐'.repeat(Math.floor(product.reviewAverage))}
                    {'☆'.repeat(5 - Math.floor(product.reviewAverage))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.reviewAverage} ({product.reviewCount}件)
                  </span>
                </div>

                {/* ショップ情報 */}
                {product.bestPrice && (
                  <div className="text-sm text-gray-600 mb-4">
                    販売店: {product.bestPrice.shopName} ({getPlatformName(product.bestPrice.platform)})
                  </div>
                )}

                {/* 購入ボタン（最安値サイト） */}
                {product.bestPrice && (
                  <a
                    href={product.bestPrice.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-white text-center py-3 rounded-lg font-medium transition-colors mb-2 ${
                      product.bestPrice.stock?.status === '予約受付中' 
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {product.bestPrice.stock?.status === '予約受付中' 
                      ? '📅 予約注文する' 
                      : `🛒 ${getPlatformName(product.bestPrice.platform)}で購入`
                    }
                  </a>
                )}

                {/* その他のサイトへのリンク */}
                {product.platforms && product.platforms.length > 1 && (
                  <div className="grid grid-cols-2 gap-2">
                    {product.platforms
                      .filter(p => p.platform !== product.bestPrice?.platform)
                      .slice(0, 2)
                      .map((platform, idx) => (
                        <a
                          key={idx}
                          href={platform.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-center py-2 px-3 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          {getPlatformName(platform.platform)}
                          <br />
                          <span className="font-bold">¥{platform.pricePerServing}</span>
                        </a>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🎯 診断結果はいかがでしたか？
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/simple-diagnosis"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🔄 もう一度診断する
              </Link>
              <Link 
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🏠 トップページに戻る
              </Link>
            </div>
            
            <div className="mt-6 text-sm text-gray-600">
              <p>💡 表示価格は1食あたりの目安です</p>
              <p>🛡️ 楽天の公式ページで最新情報をご確認ください</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}