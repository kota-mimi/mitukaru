'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  brand: string
  type: string[]
  purpose: string[]
  gender: string[]
  ageGroup: string[]
  experienceLevel: string[]
  allergens: string[]
  flavorCategory: string
  flavor: string
  features: {
    protein: number
    sugar: number
    calories: number
    fullness: number
    absorption: string
    solubility: number
    artificial: number
    lactose: string
    beauty: boolean
    domestic: boolean
  }
  taste: {
    sweetness: number
    refreshing: boolean
    fruity: boolean
    natural: boolean
  }
  timing: string[]
  pricePerServing: number
  description: string
  links: {
    amazon: string
    rakuten: string
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // 商品一覧を取得
  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/products/list')
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products)
      } else {
        setError('商品一覧の取得に失敗しました')
      }
    } catch (err) {
      setError('商品一覧の取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // 商品削除
  const deleteProduct = async (productId: string) => {
    if (!confirm('この商品を削除しますか？')) return
    
    try {
      const response = await fetch(`/api/products/list?id=${productId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('商品を削除しました')
        fetchProducts() // 一覧を再取得
      } else {
        alert('削除に失敗しました: ' + data.error)
      }
    } catch (err) {
      alert('削除中にエラーが発生しました')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">商品データを読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              保存済み商品管理
            </h1>
            <div className="flex gap-4">
              <a
                href="/admin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← 楽天商品取得に戻る
              </a>
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? '更新中...' : '一覧更新'}
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-blue-100 px-4 py-2 rounded-full">
              <span className="text-blue-800 font-medium">
                保存商品数: {products.length}個
              </span>
            </div>
            <div className="bg-green-100 px-4 py-2 rounded-full">
              <span className="text-green-800 font-medium">
                ✅ 診断システム連携済み
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* 商品一覧 */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* 商品基本情報 */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.type.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {type}
                      </span>
                    ))}
                    {product.purpose.slice(0, 2).map((purpose, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {purpose}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm">
                    {product.name}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p><strong>ブランド:</strong> {product.brand}</p>
                    <p><strong>フレーバー:</strong> {product.flavor}</p>
                    <p><strong>1食あたり:</strong> ¥{product.pricePerServing}</p>
                    <p><strong>タンパク質:</strong> {product.features.protein}g</p>
                    <p><strong>カロリー:</strong> {product.features.calories}kcal</p>
                  </div>

                  {/* 特徴バッジ */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.features.beauty && (
                      <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">美容</span>
                    )}
                    {product.features.domestic && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">国産</span>
                    )}
                    {product.features.artificial <= 2 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">無添加</span>
                    )}
                  </div>

                  {/* アクションボタン */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      詳細を見る
                    </button>
                    
                    <div className="flex gap-2">
                      <a
                        href={product.links.rakuten}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm text-center transition-colors"
                      >
                        楽天で見る
                      </a>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">商品が登録されていません</h2>
            <p className="text-gray-600 mb-6">
              楽天商品取得画面で商品を追加してください
            </p>
            <a
              href="/admin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              楽天商品取得画面に戻る
            </a>
          </div>
        )}
      </div>

      {/* 商品詳細モーダル */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">商品詳細</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">商品名</h4>
                  <p className="text-gray-900">{selectedProduct.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">ブランド</h4>
                    <p className="text-gray-900">{selectedProduct.brand}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">フレーバー</h4>
                    <p className="text-gray-900">{selectedProduct.flavor}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">種類</h4>
                  <div className="flex gap-1">
                    {selectedProduct.type.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">目的</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedProduct.purpose.map((purpose, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                        {purpose}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">タンパク質</h4>
                    <p className="text-gray-900">{selectedProduct.features.protein}g</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">カロリー</h4>
                    <p className="text-gray-900">{selectedProduct.features.calories}kcal</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">1食価格</h4>
                    <p className="text-gray-900">¥{selectedProduct.pricePerServing}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">説明</h4>
                  <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <a
                    href={selectedProduct.links.rakuten}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-center font-medium transition-colors"
                  >
                    楽天で購入
                  </a>
                  <button
                    onClick={() => {
                      deleteProduct(selectedProduct.id)
                      setSelectedProduct(null)
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}