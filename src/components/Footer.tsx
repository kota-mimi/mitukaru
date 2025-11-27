import React from 'react'
import Link from 'next/link'
import { FlaskConical } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                       <FlaskConical size={18} />
                  </div>
                  <span className="font-bold text-lg text-gray-900">ProteinMatch</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                  AIがあなたに最適なプロテインをご提案。
                  迷わないプロテイン選びで、理想のカラダ作りをサポートします。
              </p>
          </div>
          
          <div>
              <h4 className="font-bold text-gray-900 mb-4">メニュー</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/" className="hover:text-blue-600">トップページ</Link></li>
                  <li><Link href="/simple-diagnosis" className="hover:text-blue-600">プロテイン診断</Link></li>
              </ul>
          </div>
          
          <div>
               <h4 className="font-bold text-gray-900 mb-4">カテゴリー</h4>
               <ul className="space-y-2 text-sm text-gray-600">
                  <li><span className="text-gray-400">ホエイプロテイン</span></li>
                  <li><span className="text-gray-400">ソイプロテイン</span></li>
                  <li><span className="text-gray-400">コスパ重視</span></li>
              </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 text-center">
          <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} ProteinMatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer