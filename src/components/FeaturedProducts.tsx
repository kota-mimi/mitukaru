'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ArrowRight, Tag, TrendingUp, Award, DollarSign } from 'lucide-react'

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

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/featured-products')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.categories)
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
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🔥 人気のプロテイン
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            実際に売れている商品から厳選。複数のECサイトから価格・在庫・レビュー情報を比較できます。
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-16">
          {categories.map((category) => (
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

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.products.map((product) => (
                  <div key={product.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                    {/* Product Image */}
                    <div className="relative h-40 bg-gray-100">
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop'}
                        alt={product.name}
                        className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop'
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

                    {/* Product Info */}
                    <div className="p-3">
                      {/* Product Name */}
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                        {product.name.length > 40 ? product.name.substring(0, 40) + '...' : product.name}
                      </h4>

                      {/* Price */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-gray-900">
                            ¥{product.pricePerServing}
                          </span>
                          <span className="text-xs text-gray-600">/食</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          ¥{product.price.toLocaleString()}
                        </div>
                      </div>

                      {/* Nutrition */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-600">タンパク質</div>
                          <div className="text-sm font-bold text-blue-600">{product.nutrition.protein}g</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-600">カロリー</div>
                          <div className="text-sm font-bold">{product.nutrition.calories}kcal</div>
                        </div>
                      </div>

                      {/* Reviews */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{product.reviewAverage}</span>
                        </div>
                        <span className="text-gray-500 text-xs">({product.reviewCount}件)</span>
                      </div>

                      {/* Purchase Button */}
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded font-medium transition-colors text-sm"
                      >
                        🛒 購入サイトへ
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
            <Link 
              href="/simple-diagnosis"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors"
            >
              <span>🎯 無料診断を始める</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}