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

      {/* Feature Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">プロテイン選びが簡単になる理由</h2>
            <p className="text-lg text-gray-600">楽天APIと独自のマッチングアルゴリズムで、最適な商品を瞬時に発見</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-lg">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">AI診断で完璧マッチ</h3>
              <p className="text-gray-600 leading-relaxed">5つの質問に答えるだけで、1000+の楽天商品から最適な商品をAIが選出。目的・体質・好みを完璧に分析します。</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-lg">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">リアルタイム価格・在庫</h3>
              <p className="text-gray-600 leading-relaxed">楽天APIで最新の価格・在庫・レビューを即座に取得。常に正確で最新の情報で商品を比較できます。</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-lg">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">信頼の楽天品質</h3>
              <p className="text-gray-600 leading-relaxed">楽天の公式アフィリエイトリンクで安心購入。レビュー・評価・販売実績から本当に良い商品だけを提案します。</p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">安心・信頼の理由</h3>
              <p className="text-gray-600">プロテインマッチが選ばれる理由</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <div className="font-medium text-gray-900">個人情報保護</div>
                <div className="text-sm text-gray-600">会員登録不要</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💯</div>
                <div className="font-medium text-gray-900">完全無料</div>
                <div className="text-sm text-gray-600">隠れた費用なし</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="font-medium text-gray-900">瞬時に結果</div>
                <div className="text-sm text-gray-600">30秒で診断完了</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <div className="font-medium text-gray-900">楽天公式</div>
                <div className="text-sm text-gray-600">安心のアフィリエイト</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}