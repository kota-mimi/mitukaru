'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { DiagnoseResponse } from '@/app/api/diagnose/route'
import type { Protein } from '@/lib/proteins'

export default function ResultPage() {
  const [result, setResult] = useState<DiagnoseResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedResult = localStorage.getItem('diagnoseResult')
    if (savedResult) {
      setResult(JSON.parse(savedResult))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">結果を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            結果が見つかりません
          </h1>
          <p className="text-gray-600 mb-6">
            診断結果を取得できませんでした。もう一度診断を行ってください。
          </p>
          <Link
            href="/diagnose"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 inline-block"
          >
            診断をやり直す
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              診断結果
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">{result.message}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {result.recommendations.map((protein, index) => (
              <ProteinCard 
                key={`${protein.name}-${index}`}
                protein={protein} 
                rank={index + 1} 
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/diagnose"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              もう一度診断する
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              トップに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProteinCard({ protein, rank }: { protein: Protein; rank: number }) {
  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500'
      case 2: return 'bg-gray-400'
      case 3: return 'bg-amber-600'
      default: return 'bg-blue-500'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return rank.toString()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 relative">
      <div className={`absolute top-3 right-3 ${getRankBadgeColor(rank)} text-white text-sm font-bold px-2 py-1 rounded-full min-w-[24px] text-center`}>
        {getRankIcon(rank)}
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 pr-12">
          {protein.name}
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">ブランド:</span> {protein.brand}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">タイプ:</span> {protein.type}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">味:</span> {protein.flavor}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <p className="font-medium text-gray-700">タンパク質</p>
          <p className="text-lg font-bold text-blue-600">{protein.proteinPerServing}g</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="font-medium text-gray-700">1食価格</p>
          <p className="text-lg font-bold text-green-600">¥{protein.pricePerServing}</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-4 space-y-1">
        <p>カロリー: {protein.calories}kcal</p>
        <p>糖質: {protein.sugarPerServing}g</p>
      </div>

      <div className="flex space-x-2">
        {protein.amazonUrl && (
          <a
            href={protein.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-center py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            Amazon
          </a>
        )}
        {protein.rakutenUrl && (
          <a
            href={protein.rakutenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            楽天
          </a>
        )}
      </div>
    </div>
  )
}