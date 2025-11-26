import React from 'react'
import { Protein } from '@/lib/proteins'

interface ProteinCardProps {
  protein: Protein
  rank: number
}

const ProteinCard: React.FC<ProteinCardProps> = ({ protein, rank }) => {
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
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 relative hover:shadow-lg transition-shadow h-full">
      <div className={`absolute top-3 right-3 ${getRankBadgeColor(rank)} text-white text-sm font-bold px-2 py-1 rounded-full min-w-[24px] text-center`}>
        {getRankIcon(rank)}
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 pr-12 leading-tight">
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
        <p className="text-blue-600 font-medium">{protein.purpose}</p>
      </div>

      <div className="flex space-x-2">
        {protein.amazonUrl && protein.amazonUrl.trim() !== '' && (
          <a
            href={protein.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-center py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            Amazon
          </a>
        )}
        {protein.rakutenUrl && protein.rakutenUrl.trim() !== '' && (
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

export default ProteinCard