'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ArrowRight, Tag, TrendingUp, Award, DollarSign, Search, X, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react'

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

interface Category {
  category: string
  categoryName: string
  products: Product[]
}

const categoryIcons = {
  popular: <TrendingUp className="w-5 h-5" />,
  cospa: <DollarSign className="w-5 h-5" />,
  sale: <Tag className="w-5 h-5" />,
  premium: <Star className="w-5 h-5" />
}

const categoryColors = {
  popular: 'bg-red-500',
  cospa: 'bg-orange-500',
  sale: 'bg-green-500',
  premium: 'bg-purple-500'
}

export default function FeaturedProducts() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating' | 'review'>('default')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // キャッシュを強制的に無効化
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/featured-products?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.categories)
          setFilteredCategories(data.categories)
        } else {
          setError(data.error)
        }
      } catch (err) {
        console.error('人気商品取得エラー:', err)
        setError('商品情報の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  // 検索・フィルタリング・ソート機能
  useEffect(() => {
    let filtered = categories.map(category => ({
      ...category,
      products: category.products.filter(product => {
        // テキスト検索
        const matchesSearch = !searchTerm.trim() || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.type.toLowerCase().includes(searchTerm.toLowerCase())
        
        // 価格帯フィルター
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
        
        return matchesSearch && matchesPrice
      })
    })).filter(category => category.products.length > 0)

    // ソート機能
    filtered = filtered.map(category => ({
      ...category,
      products: category.products.sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price
          case 'price-desc':
            return b.price - a.price
          case 'rating':
            return b.reviewAverage - a.reviewAverage
          case 'review':
            return b.reviewCount - a.reviewCount
          default:
            return 0
        }
      })
    }))

    setFilteredCategories(filtered)
  }, [searchTerm, categories, sortBy, priceRange])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">人気商品を読み込み中...</h2>
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-red-800 mb-2">商品情報の取得に失敗</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🔥 人気のプロテイン
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            実際に売れている商品から厳選。複数のECサイトから価格・在庫・レビュー情報を比較できます。
          </p>
          
          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="プロテインを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="default">デフォルト</option>
                  <option value="price-asc">価格: 安い順</option>
                  <option value="price-desc">価格: 高い順</option>
                  <option value="rating">評価順</option>
                  <option value="review">レビュー数順</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  showFilters 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                フィルター
              </button>
            </div>

            {/* Price Range Filter */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">価格帯:</span>
                  <input
                    type="number"
                    placeholder="最小"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-500">〜</span>
                  <input
                    type="number"
                    placeholder="最大"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-sm text-gray-500">円</span>
                  <button
                    onClick={() => setPriceRange([0, 10000])}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    リセット
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-16">
          {filteredCategories.map((category) => (
            <div key={category.category} className="relative">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${categoryColors[category.category as keyof typeof categoryColors]} rounded-xl text-white`}>
                    {categoryIcons[category.category as keyof typeof categoryIcons]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{category.categoryName}</h3>
                    <p className="text-gray-600">{category.products.length}商品をピックアップ</p>
                  </div>
                </div>
                <Link 
                  href="/products" 
                  className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  商品を見る
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Products Grid - Diagnosis Style (Compact) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {category.products.slice(0, 12).map((product, index) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Ranking Badge (for first 3 items) */}
                    {index < 3 && (
                      <div className={`absolute z-10 m-2 px-2 py-1 rounded-full text-white font-bold text-xs ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index === 0 ? '🥇 1位' : index === 1 ? '🥈 2位' : '🥉 3位'}
                      </div>
                    )}

                    {/* NEW Badge for others */}
                    {index >= 3 && (
                      <div className="absolute z-10 top-2 right-2">
                        <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          NEW
                        </div>
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="relative bg-gray-100">
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200&h=150&fit=crop'}
                        alt={product.name}
                        className="w-full h-32 object-contain bg-gray-50 rounded-t-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200&h=150&fit=crop'
                        }}
                      />
                    </div>

                    <div className="p-3">
                      {/* Brand and Type Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {product.brand.length > 6 ? product.brand.substring(0, 6) + '...' : product.brand}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {product.type}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm">
                        {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                      </h3>

                      {/* Price Display (Diagnosis Style) */}
                      <div className="mb-3">
                        <div className="text-lg font-bold text-gray-900">
                          ¥{product.pricePerServing}
                          <span className="text-xs font-normal text-gray-600">/食</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          本体価格: ¥{product.price?.toLocaleString() || '0'}
                        </div>
                      </div>

                      {/* Nutrition Info */}
                      <div className="grid grid-cols-2 gap-1 mb-3 text-xs">
                        <div className="bg-gray-50 p-1 rounded text-center">
                          <div className="text-gray-600">プロテイン</div>
                          <div className="font-bold text-gray-900">{product.nutrition.protein}g</div>
                        </div>
                        <div className="bg-gray-50 p-1 rounded text-center">
                          <div className="text-gray-600">カロリー</div>
                          <div className="font-bold text-gray-900">{product.nutrition.calories}</div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-1 mb-3 text-xs">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="font-medium">{product.reviewAverage}</span>
                        <span className="text-gray-500">({product.reviewCount})</span>
                      </div>

                      {/* Purchase Button */}
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-lg font-semibold text-xs transition-colors"
                      >
                        🛒 購入する
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* View All Button */}
              {category.products.length > 12 && (
                <div className="mt-8 text-center">
                  <Link 
                    href="/products"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0l-4-4m4 4l-4 4" />
                    </svg>
                    全{category.products.length}商品を見る
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🎯 もっと正確な診断で最適な商品を見つけませんか？
            </h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              5つの質問に答えるだけで、あなたの目的・体質・好みに100%マッチしたプロテインを提案します。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/simple-diagnosis"
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors"
              >
                <span>🎯 無料診断を始める</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/products"
                className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 font-bold py-4 px-8 rounded-xl transition-colors"
              >
                <span>📦 全商品を見る</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}