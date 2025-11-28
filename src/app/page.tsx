import Link from 'next/link'
import { ArrowRight, CheckCircle2, Search, ShoppingBag, TrendingUp, Star, Award } from 'lucide-react'
import FeaturedProducts from '@/components/FeaturedProducts'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-[#F8F9FA] overflow-hidden pt-20 pb-28 sm:pt-32 sm:pb-40">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
            最適なプロテインが、<br/>
            <span className="text-blue-600">もっと簡単に見つかる。</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            数ある商品の中から、あなたの目的・予算・好みに<br className="hidden sm:block"/>
            ぴったり合うプロテインを瞬時に提案します。
          </p>
          
          {/* Main Actions */}
          <div className="flex justify-center mb-16">
             <Link 
              href="/simple-diagnosis" 
              className="group bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-5 px-12 rounded-full shadow-xl shadow-blue-900/10 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <span>🎯 5ステップでプロテインを見つける</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-500 font-medium opacity-80">
            <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600" />
                <span>会員登録不要</span>
            </div>
            <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600" />
                <span>完全無料</span>
            </div>
            <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600" />
                <span>ECサイト直結</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-blue-100">楽天商品を分析</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">診断実施数</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-blue-100">平均満足度</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24h</div>
              <div className="text-blue-100">リアルタイム価格</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

    </div>
  )
}