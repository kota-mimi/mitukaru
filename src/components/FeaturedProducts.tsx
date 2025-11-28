'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ArrowRight, Tag, TrendingUp, Award, DollarSign, Search, X } from 'lucide-react'

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
  whey: <TrendingUp className="w-5 h-5" />,
  soy: <Award className="w-5 h-5" />,
  budget: <DollarSign className="w-5 h-5" />,
  premium: <Star className="w-5 h-5" />
}

const categoryColors = {
  whey: 'bg-blue-500',
  soy: 'bg-green-500',
  budget: 'bg-orange-500',
  premium: 'bg-purple-500'
}

export default function FeaturedProducts() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/featured-products')
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

  // 検索機能
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories)
      return
    }

    const filtered = categories.map(category => ({
      ...category,
      products: category.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.products.length > 0)

    setFilteredCategories(filtered)
  }, [searchTerm, categories])

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
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <div className="relative">
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
                  href="/simple-diagnosis" 
                  className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  あなた専用の診断はこちら
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Products Grid - Ultra Compact */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {category.products.map((product) => (
                  <div key={product.id} className="group bg-white border border-gray-100 rounded-md overflow-hidden hover:shadow-md transition-all duration-300">
                    {/* Product Image - Square Layout */}
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop'}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop'
                        }}
                      />
                      
                      {/* Category Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs font-bold text-white rounded ${categoryColors[product.category as keyof typeof categoryColors]}`}>
                          {product.type}
                        </span>
                      </div>

                      {/* Brand Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs font-medium bg-white/90 text-gray-700 rounded">
                          {product.brand}
                        </span>
                      </div>
                    </div>

                    {/* Product Info - Ultra Compact */}
                    <div className="p-1">
                      {/* Product Name */}
                      <h4 className="font-bold text-gray-900 mb-1 text-xs group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">
                        {product.name.length > 25 ? product.name.substring(0, 25) + '...' : product.name}
                      </h4>

                      {/* Price */}
                      <div className="mb-1">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-bold text-gray-900">
                            ¥{product.pricePerServing}
                          </span>
                          <span className="text-xs text-gray-600">/食</span>
                        </div>
                      </div>

                      {/* Reviews + Nutrition */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                          <span className="text-xs font-medium">{product.reviewAverage}</span>
                        </div>
                        <span className="text-xs text-blue-600 font-bold">{product.nutrition.protein}g</span>
                      </div>

                      {/* Purchase Button */}
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-1 rounded text-xs font-medium transition-colors"
                      >
                        🛒 購入
                      </a>
                    </div>
                  </div>
                ))}
              </div>
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