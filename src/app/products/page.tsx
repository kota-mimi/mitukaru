'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Search, X, Filter, Grid3X3, List } from 'lucide-react'

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
  price: number
  pricePerServing: number
  shopName: string
  affiliateUrl: string
  category: string
}

export default function AllProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('price')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch('/api/featured-products')
        const data = await response.json()
        
        if (data.success) {
          const products = data.categories.flatMap((cat: any) => cat.products)
          setAllProducts(products)
          setFilteredProducts(products)
        } else {
          setError(data.error)
        }
      } catch (err) {
        console.error('商品取得エラー:', err)
        setError('商品情報の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [])

  // フィルター・検索・ソート機能
  useEffect(() => {
    let filtered = allProducts

    // タイプフィルター
    if (filterType !== 'all') {
      filtered = filtered.filter(product => 
        product.type.toLowerCase().includes(filterType.toLowerCase())
      )
    }

    // 検索
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.pricePerServing - b.pricePerServing
        case 'rating':
          return b.reviewAverage - a.reviewAverage
        case 'protein':
          return b.nutrition.protein - a.nutrition.protein
        case 'reviews':
          return b.reviewCount - a.reviewCount
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }, [searchTerm, sortBy, filterType, allProducts])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">全商品読み込み中...</h1>
            <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <h1 className="text-2xl font-bold text-red-800 mb-2">商品情報の取得に失敗</h1>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">全商品一覧</h1>
              <p className="text-gray-600 mt-2">{filteredProducts.length}件の商品が見つかりました</p>
            </div>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ← トップに戻る
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="商品を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">全タイプ</option>
                <option value="ホエイ">ホエイ</option>
                <option value="ソイ">ソイ</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="price">価格順</option>
                <option value="rating">評価順</option>
                <option value="protein">タンパク質順</option>
                <option value="reviews">レビュー数順</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">検索条件に一致する商品が見つかりませんでした</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <div key={product.id} className={viewMode === 'grid' 
                ? "group bg-white border border-gray-100 rounded-md overflow-hidden hover:shadow-md transition-all duration-300"
                : "group bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all duration-300 flex gap-4"
              }>
                {/* Product Image */}
                <div className={viewMode === 'grid' 
                  ? "relative aspect-square bg-gray-100"
                  : "relative w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0"
                }>
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop'
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className={viewMode === 'grid' ? "p-1" : "flex-1"}>
                  <h3 className={viewMode === 'grid' 
                    ? "font-bold text-gray-900 mb-1 text-xs group-hover:text-blue-600 transition-colors leading-tight line-clamp-1"
                    : "font-bold text-gray-900 mb-2 text-sm group-hover:text-blue-600 transition-colors line-clamp-2"
                  }>
                    {viewMode === 'grid' 
                      ? (product.name.length > 25 ? product.name.substring(0, 25) + '...' : product.name)
                      : (product.name.length > 60 ? product.name.substring(0, 60) + '...' : product.name)
                    }
                  </h3>

                  <div className="mb-1">
                    <div className="flex items-baseline gap-0.5">
                      <span className={viewMode === 'grid' ? "text-sm font-bold text-gray-900" : "text-lg font-bold text-gray-900"}>
                        ¥{product.pricePerServing}
                      </span>
                      <span className="text-xs text-gray-600">/食</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                      <span className="text-xs font-medium">{product.reviewAverage}</span>
                    </div>
                    <span className="text-xs text-blue-600 font-bold">{product.nutrition.protein}g</span>
                  </div>

                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={viewMode === 'grid'
                      ? "block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-1 rounded text-xs font-medium transition-colors"
                      : "inline-block bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded text-sm font-medium transition-colors"
                    }
                  >
                    🛒 購入
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}