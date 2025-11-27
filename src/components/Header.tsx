'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FlaskConical, Search, Menu, X } from 'lucide-react'

const Header: React.FC = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-105">
              <FlaskConical size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Protein<span className="text-blue-600">Match</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/simple-diagnosis" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              🎯 プロテイン診断
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-900"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
                <div className="px-4 py-6 space-y-4">
                    <Link 
                        href="/" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-base font-bold text-gray-900"
                    >
                        トップページ
                    </Link>
                    <Link 
                        href="/simple-diagnosis" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-center w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
                    >
                        🎯 プロテイン診断
                    </Link>
                </div>
            </div>
        )}
      </header>
    </>
  )
}

export default Header