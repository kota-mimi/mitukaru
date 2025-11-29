'use client'

import { useState, useEffect } from 'react'

interface Product {
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
  affiliateUrl: string
  category: string
  nutrition: {
    protein: number
    calories: number
    servings: number
    servingSize: number
  }
  type: string
  flavor: string
}

interface Category {
  category: string
  categoryName: string
  products: Product[]
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('price')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  const ITEMS_PER_PAGE = 24

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      
      // クライアントサイド用APIエンドポイントから取得
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (data.success && data.categories) {
        setCategories(data.categories)
        console.log(`✅ 商品データを読み込み (${data.source}):`, data.categories.length, 'カテゴリ')
      } else {
        console.error('❌ 商品データ取得失敗:', data.error)
      }
    } catch (error) {
      console.error('❌ 商品データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // 全商品を平坦化
  const allProducts = categories.flatMap(cat => 
    cat.products.map(product => ({
      ...product,
      categoryName: cat.categoryName
    }))
  )

  // フィルタリング
  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // ソート
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'protein':
        return b.nutrition.protein - a.nutrition.protein
      case 'rating':
        return b.reviewAverage - a.reviewAverage
      case 'review-count':
        return b.reviewCount - a.reviewCount
      default:
        return 0
    }
  })

  // ページネーション
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // ユニークカテゴリ取得
  const uniqueCategories = Array.from(new Set(categories.map(cat => cat.category)))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">プロテイン商品を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">プロテイン商品一覧</h1>
          <p className="text-gray-600">楽天市場から厳選された{allProducts.length}商品を比較検討</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* フィルター・検索バー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">商品検索</label>
              <input
                type="text"
                placeholder="商品名・ブランド名で検索"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            {/* カテゴリフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="all">すべてのカテゴリ</option>
                {uniqueCategories.map(category => {
                  const categoryInfo = categories.find(cat => cat.category === category)
                  return (
                    <option key={category} value={category}>
                      {categoryInfo?.categoryName || category}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* ソート */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">並び順</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price">価格が安い順</option>
                <option value="price-desc">価格が高い順</option>
                <option value="protein">タンパク質含有量順</option>
                <option value="rating">評価が高い順</option>
                <option value="review-count">レビュー数順</option>
              </select>
            </div>

            {/* 表示件数情報 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">表示中</label>
              <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                {filteredProducts.length}件 / 全{allProducts.length}商品
              </div>
            </div>
          </div>
        </div>

        {/* 商品グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
              {/* 商品画像 */}
              <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                <img
                  src={product.imageUrl || '/placeholder-protein.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-protein.jpg'
                  }}
                />
              </div>

              {/* 商品情報 */}
              <div className="p-4">
                {/* ブランド */}
                <div className="text-xs text-blue-600 font-medium mb-1">{product.brand}</div>
                
                {/* 商品名 */}
                <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 h-10">
                  {product.name}
                </h3>

                {/* 栄養情報 */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <div>タンパク質: {product.nutrition.protein}g</div>
                  <div>カロリー: {product.nutrition.calories}kcal</div>
                </div>

                {/* レビュー */}
                {product.reviewCount > 0 && (
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-400 text-sm">★{product.reviewAverage.toFixed(1)}</span>
                    <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                  </div>
                )}

                {/* 価格 */}
                <div className="mb-3">
                  <div className="text-lg font-bold text-gray-900">¥{product.price.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">1回分 ¥{product.pricePerServing}</div>
                </div>

                {/* 購入ボタン */}
                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md text-center transition-colors"
                >
                  楽天で購入
                </a>

                {/* ショップ名 */}
                <div className="text-xs text-gray-400 text-center mt-2">{product.shopName}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mb-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>

            {/* ページ番号 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1
              if (totalPages > 5) {
                if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        )}

        {/* 統計情報 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">商品統計</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-600">カテゴリ数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{allProducts.length}</div>
              <div className="text-sm text-gray-600">総商品数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {allProducts.length > 0 ? Math.round(allProducts.reduce((sum, p) => sum + p.nutrition.protein, 0) / allProducts.length) : 0}g
              </div>
              <div className="text-sm text-gray-600">平均タンパク質</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ¥{allProducts.length > 0 ? Math.round(allProducts.reduce((sum, p) => sum + p.pricePerServing, 0) / allProducts.length) : 0}
              </div>
              <div className="text-sm text-gray-600">平均1回分価格</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}