'use client'

import { useState } from 'react'

interface RakutenProduct {
  id: string
  name: string
  brand: string
  price: number
  pricePerServing: number
  imageUrl: string
  shopName: string
  reviewCount: number
  reviewAverage: number
  description: string
  url: string
  type: string[]
  features: {
    protein: number
    calories: number
    servings: number
  }
  tags: string[]
}

interface RakutenResponse {
  success: boolean
  products: RakutenProduct[]
  totalCount: number
  page: number
  pageCount: number
}

export default function AdminPage() {
  const [products, setProducts] = useState<RakutenProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('プロテイン')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [keywordSuggestions] = useState([
    'プロテイン',
    'ホエイプロテイン',
    'ソイプロテイン',
    'ザバス プロテイン',
    'DNS プロテイン',
    'ビーレジェンド',
    'マイプロテイン'
  ])

  const searchProducts = async (page = 1) => {
    console.log('検索開始:', { keyword, apiKey: apiKey.slice(0, 10) + '...', page })
    
    if (!apiKey.trim()) {
      setError('楽天APIキーを入力してください')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('楽天一括取得API呼び出し開始...')
      // 一括取得APIを使用して全プロテイン商品を取得
      const response = await fetch(`/api/rakuten-bulk?appId=${apiKey}&maxPages=5`)
      
      console.log('レスポンス受信:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('APIエラー:', response.status, errorText)
        throw new Error(`API呼び出しに失敗しました (${response.status}): ${errorText}`)
      }
      
      const data: RakutenResponse = await response.json()
      console.log('取得データ:', data)
      
      if (data.success) {
        setProducts(data.products)
        setTotalCount(data.totalCount)
        setCurrentPage(1)
        console.log('商品取得成功:', data.products.length, '件')
      } else {
        console.error('データエラー:', data)
        setError('商品取得に失敗しました: ' + JSON.stringify(data))
      }
      
    } catch (err: any) {
      console.error('検索エラー:', err)
      setError(err.message || '不明なエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const addToDatabase = async (product: RakutenProduct) => {
    try {
      const response = await fetch('/api/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      })
      
      if (response.ok) {
        alert(`${product.name} をデータベースに追加しました`)
      } else {
        alert('追加に失敗しました')
      }
    } catch (err) {
      alert('追加中にエラーが発生しました')
    }
  }

  const addAllToDatabase = async () => {
    if (products.length === 0) return
    
    const confirmed = confirm(`${products.length}個の商品をすべてデータベースに追加しますか？`)
    if (!confirmed) return

    setLoading(true)
    try {
      for (const product of products) {
        await addToDatabase(product)
        await new Promise(resolve => setTimeout(resolve, 200)) // API制限対策
      }
      alert('すべての商品を追加しました')
    } catch (err) {
      alert('一括追加中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            楽天商品管理システム
          </h1>
          
          {/* APIキー設定 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              楽天APIキー
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="楽天アプリケーションIDを入力"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-2">
              楽天デベロッパーセンターで取得したアプリケーションIDを入力してください
            </p>
          </div>

          {/* 検索セクション */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索キーワード
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="プロテイン、ブランド名など"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                推奨キーワード
              </label>
              <div className="flex flex-wrap gap-2">
                {keywordSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setKeyword(suggestion)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => searchProducts(1)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? '全商品取得中...' : '楽天全プロテイン商品取得'}
            </button>
            
            {products.length > 0 && (
              <button
                onClick={addAllToDatabase}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                全商品を追加
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* 検索結果 */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                楽天プロテイン商品: {totalCount}件
              </h2>
              <div className="text-sm text-gray-600 bg-green-100 px-3 py-1 rounded-full">
                ✅ 楽天市場全商品取得完了
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={product.imageUrl || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.type.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p>ブランド: {product.brand}</p>
                      <p>価格: ¥{product.price.toLocaleString()}</p>
                      <p>1食あたり: ¥{product.pricePerServing}</p>
                      <p>タンパク質: {product.features.protein}g</p>
                      <p>レビュー: ⭐{product.reviewAverage} ({product.reviewCount}件)</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => addToDatabase(product)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      データベースに追加
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ページネーション */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => searchProducts(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                前のページ
              </button>
              
              <span className="text-gray-700">
                {currentPage} / {Math.ceil(totalCount / 30)}
              </span>
              
              <button
                onClick={() => searchProducts(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalCount / 30) || loading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                次のページ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}