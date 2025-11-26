'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { proteins } from '@/lib/proteins'
import ProteinCard from './ProteinCard'

const ProteinSlider: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = 300
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="py-24 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">人気のプロテイン</h2>
            <p className="text-sm text-gray-600">多くのユーザーに選ばれているベストセラー</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')} 
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors hidden sm:flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors hidden sm:flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar snap-x snap-mandatory"
        >
          {proteins.slice(0, 8).map((protein, index) => (
            <div key={index} className="flex-none w-[280px] sm:w-[300px] snap-center">
              <ProteinCard protein={protein} rank={index + 1} />
            </div>
          ))}
          <div className="flex-none w-[100px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRight size={20} />
              </div>
              <span>もっと見る</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

export default ProteinSlider