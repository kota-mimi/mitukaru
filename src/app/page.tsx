import Link from 'next/link'
import { ArrowRight, CheckCircle2, Search, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { proteins } from '@/lib/proteins'
import ProteinSlider from '@/components/ProteinSlider'

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
              href="/diagnose" 
              className="group bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-5 px-10 rounded-full shadow-xl shadow-blue-900/10 transition-all transform hover:-translate-y-1 flex items-center gap-3"
            >
              <span>自分に合うプロテインを見つける</span>
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

      {/* Popular Section (Slider) */}
      <ProteinSlider />

      {/* Feature Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">5つの質問で診断</h3>
              <p className="text-sm text-gray-600 leading-relaxed">目的や予算に合わせて、AIがあなたに最適な商品をピックアップします。</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">詳細検索・比較</h3>
              <p className="text-sm text-gray-600 leading-relaxed">価格順や成分、フレーバーなど、ECサイトのような感覚で探せます。</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">そのまま購入</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Amazonや楽天のリンクから、気になった商品をその場で購入できます。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}