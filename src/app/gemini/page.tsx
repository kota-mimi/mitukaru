'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Menu, X, Bookmark, ChevronDown } from 'lucide-react';
import { Product, SavedItem } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { AIChatWidget } from '@/components/AIChatWidget';
import { AIDiagnosisModal } from '@/components/AIDiagnosisModal';
import { ProteinGuide } from '@/components/ProteinGuide';
import { Button } from '@/components/ui/Button';
import { fetchProducts } from '@/lib/productService';

export default function GeminiPage() {
  const [currentView, setCurrentView] = useState<'HOME' | 'GUIDE'>('HOME');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('RECOMMENDED');
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { key: 'ALL', label: '全て', count: products.length },
    { key: 'WHEY', label: 'ホエイ', count: products.filter(p => p.category === 'WHEY').length },
    { key: 'CASEIN', label: 'カゼイン', count: products.filter(p => p.category === 'CASEIN').length },
    { key: 'VEGAN', label: 'ソイ/植物性', count: products.filter(p => p.category === 'VEGAN').length },
  ];

  const handleSaveProduct = (product: Product) => {
    setSavedItems(prev => {
      const isAlreadySaved = prev.some(item => item.id === product.id);
      if (isAlreadySaved) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, { ...product, savedAt: new Date() }];
      }
    });
  };

  const handleDiagnosisComplete = (recommendedType: string) => {
    setSelectedCategory(recommendedType);
    setShowDiagnosisModal(false);
  };

  // 商品データの初期読み込み
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const productData = await fetchProducts({ keyword: 'プロテイン', page: 1 });
        setProducts(productData);
        setFilteredProducts(productData);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // フィルタリング処理
  useEffect(() => {
    let filtered = products;

    // Category filter
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products]);

  if (currentView === 'GUIDE') {
    return <ProteinGuide onBack={() => setCurrentView('HOME')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg font-black text-lg">
                PRO
              </div>
              <span className="text-xl font-black text-slate-800">-TEIN AI</span>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setCurrentView('HOME')}
                className="text-sm font-bold transition-colors text-blue-600"
              >
                ショップ
              </button>
              <button 
                onClick={() => setCurrentView('GUIDE')}
                className={`text-sm font-bold transition-colors ${
                  'text-slate-600 hover:text-slate-800'
                }`}
              >
                プロテインガイド
              </button>
              <button 
                onClick={() => setShowSavedItems(!showSavedItems)}
                className="relative text-sm font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1"
              >
                <Bookmark className="w-4 h-4" />
                気になるリスト
                {savedItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {savedItems.length}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            AI が選ぶ、あなたにベストな<br />
            <span className="text-yellow-300">プロテイン</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            5つの質問に答えるだけで、目的・体質・好みにぴったりのプロテインを瞬時に診断
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => setShowDiagnosisModal(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-full shadow-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            無料でAI診断を始める
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Search & Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="商品名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
              >
                <option value="RECOMMENDED">おすすめ順</option>
                <option value="PRICE_LOW">価格の安い順</option>
                <option value="PRICE_HIGH">価格の高い順</option>
                <option value="RATING">評価の高い順</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedCategory === category.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
                <div className="aspect-[4/3] bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSave={handleSaveProduct}
                isSaved={savedItems.some(item => item.id === product.id)}
                onOpenDetail={(product) => console.log('Product detail:', product)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">商品が見つかりませんでした</h3>
            <p className="text-slate-500 mb-6">検索条件を変更してお試しください</p>
            <Button onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); }}>
              フィルターをリセット
            </Button>
          </div>
        )}
      </div>

      {/* Saved Items Sidebar */}
      {showSavedItems && (
        <div className="fixed inset-0 z-50 flex">
          <div className="bg-black/50 flex-1" onClick={() => setShowSavedItems(false)} />
          <div className="bg-white w-96 h-full overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">気になるリスト</h2>
              <button onClick={() => setShowSavedItems(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              {savedItems.length === 0 ? (
                <p className="text-center text-slate-500 py-8">まだ保存した商品がありません</p>
              ) : (
                <div className="space-y-4">
                  {savedItems.map(item => (
                    <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                      <h3 className="font-bold text-sm text-slate-800 mb-2">{item.name}</h3>
                      <p className="text-xs text-slate-500">保存日: {item.savedAt.toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Diagnosis Modal */}
      <AIDiagnosisModal
        isOpen={showDiagnosisModal}
        onClose={() => setShowDiagnosisModal(false)}
        onComplete={handleDiagnosisComplete}
      />

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}