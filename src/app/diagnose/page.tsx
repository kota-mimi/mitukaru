'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { DiagnoseRequest } from '@/app/api/diagnose/route'

export default function DiagnosePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<DiagnoseRequest>({
    purpose: '',
    taste: '',
    budget: '',
    lactoseIntolerant: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // バリデーション
    if (!formData.purpose || !formData.taste || !formData.budget) {
      alert('すべての項目を選択してください')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('診断に失敗しました')
      }

      const result = await response.json()
      
      // 結果をlocalStorageに保存
      localStorage.setItem('diagnoseResult', JSON.stringify(result))
      
      // 結果ページに遷移
      router.push('/result')
    } catch (error) {
      alert('診断中にエラーが発生しました。もう一度お試しください。')
      console.error('診断エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              プロテイン診断
            </h1>
            <p className="text-gray-600">
              以下の質問にお答えください。あなたにぴったりのプロテインをご提案します。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 目的 */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                1. プロテインを飲む目的は？
              </label>
              <div className="grid grid-cols-1 gap-3">
                {['ダイエット', '筋トレ', '健康維持'].map((option) => (
                  <label 
                    key={option}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.purpose === option 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="purpose"
                      value={option}
                      checked={formData.purpose === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 味の好み */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                2. 味の好みは？
              </label>
              <div className="grid grid-cols-1 gap-3">
                {['甘い', 'さっぱり', 'どちらでも'].map((option) => (
                  <label 
                    key={option}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.taste === option 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="taste"
                      value={option}
                      checked={formData.taste === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, taste: e.target.value }))}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 予算 */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                3. 1食あたりの予算は？
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: '低', label: '低（〜120円）' },
                  { value: '中', label: '中（120〜180円）' },
                  { value: '高', label: '高（180円〜）' }
                ].map((option) => (
                  <label 
                    key={option.value}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.budget === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={option.value}
                      checked={formData.budget === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 乳糖不耐症 */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                4. 乳糖（牛乳）に弱いですか？
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: true, label: 'はい' },
                  { value: false, label: 'いいえ' }
                ].map((option) => (
                  <label 
                    key={option.value.toString()}
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.lactoseIntolerant === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lactoseIntolerant"
                      value={option.value.toString()}
                      checked={formData.lactoseIntolerant === option.value}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        lactoseIntolerant: e.target.value === 'true' 
                      }))}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 pt-8">
              <Link 
                href="/"
                className="flex-1 text-center py-4 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                戻る
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-4 px-6 rounded-lg text-white font-bold transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? '診断中...' : '診断する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}