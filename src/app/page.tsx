import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            プロテイン AI 診断
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            プロテインで迷っている人向けの<br />
            AI診断サイト
          </p>
        </div>
        
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">こんな方におすすめ</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• どのプロテインを選べばいいかわからない</li>
              <li>• 自分の目的に合ったものが知りたい</li>
              <li>• コスパの良い商品を見つけたい</li>
            </ul>
          </div>
        </div>

        <Link 
          href="/diagnose"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 inline-block"
        >
          診断を始める
        </Link>
        
        <p className="text-xs text-gray-500 mt-4">
          約1分で完了します
        </p>
      </div>
    </div>
  )
}