'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Menu, Search, Dumbbell, Zap, CheckCircle2, TrendingUp, Filter, Sparkles, BookOpen, X, ChevronDown, ArrowUpDown, SlidersHorizontal, Trophy, Coins, Tag, ScanSearch } from 'lucide-react';
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
  const [isSavedListOpen, setIsSavedListOpen] = useState(false);
  
  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('RATING');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // UI States
  const [activeTabId, setActiveTabId] = useState<string>('POPULAR');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Product data
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set page title and favicon
  useEffect(() => {
    document.title = 'MITSUKERU | 最適なプロテインが見つかる';
    
    // Set favicon
    const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (existingFavicon) {
      existingFavicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23005A9C"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="14" font-weight="bold">M</text></svg>';
    } else {
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23005A9C"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="14" font-weight="bold">M</text></svg>';
      document.head.appendChild(favicon);
    }
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const productData = await fetchProducts({ keyword: 'プロテイン', page: 1 });
        setProducts(productData);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const toggleSave = (product: Product) => {
    setSavedItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return [...prev, { ...product, savedAt: new Date() }];
    });
  };

  const removeSavedItem = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleDiagnosisComplete = (recommendedType: string) => {
    setCurrentView('HOME');
    setIsDiagnosisOpen(false);
    
    // 診断結果に基づいて推薦商品を選択（最大10個）
    const filteredProducts = products.filter(product => {
      if (recommendedType === 'WHEY') return product.category === 'WHEY';
      if (recommendedType === 'VEGAN') return product.category === 'VEGAN';
      return true; // ALL の場合
    });
    
    // 10個に制限して推薦商品を設定
    const recommended = filteredProducts.slice(0, 10);
    setRecommendedProducts(recommended);
    setShowRecommendations(true);
    
    setTimeout(() => {
        document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Quick Filter Tabs Logic
  const quickFilters = [
    { 
      id: 'POPULAR', 
      label: '人気ランキング', 
      apply: () => {
        setSortBy('RATING');
        setSelectedCategory('ALL');
        setSearchQuery('');
        setMinPrice('');
        setMaxPrice('');
      }
    },
    { 
      id: 'COSPHA', 
      label: 'コスパ最強', 
      apply: () => {
        setSortBy('PRICE_ASC');
        setSelectedCategory('ALL');
        setSearchQuery('');
        setMinPrice('');
        setMaxPrice('');
      }
    },
    { 
      id: 'SALE', 
      label: 'セール中', 
      apply: () => {
        setSearchQuery('セール');
        setSelectedCategory('ALL');
        setSortBy('RATING');
      }
    },
  ];

  const handleQuickFilter = (id: string, applyFn: () => void) => {
    setActiveTabId(id);
    applyFn();
  };

  // Logic for filtering
  let displayProducts = products.filter(p => {
    // 1. Search Query Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(query);
      const matchDesc = p.description.toLowerCase().includes(query);
      const matchTags = p.tags.some(t => t.toLowerCase().includes(query));
      if (!matchName && !matchDesc && !matchTags) return false;
    }

    // 2. Category Filter
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
      return false;
    }

    // 3. Price Range Filter
    const productMinPrice = Math.min(...p.shops.map(s => s.price));
    if (minPrice && productMinPrice < Number(minPrice)) return false;
    if (maxPrice && productMinPrice > Number(maxPrice)) return false;
    
    return true;
  });

  // Sorting Logic
  displayProducts.sort((a, b) => {
    const minPriceA = Math.min(...a.shops.map(s => s.price));
    const minPriceB = Math.min(...b.shops.map(s => s.price));

    if (sortBy === 'PRICE_ASC') return minPriceA - minPriceB;
    if (sortBy === 'PRICE_DESC') return minPriceB - minPriceA;
    return b.rating - a.rating; // Default RATING
  });

  const categories = [
    { id: 'ALL', label: 'すべて' },
    { id: 'WHEY', label: 'ホエイ' },
    { id: 'CASEIN', label: 'カゼイン' },
    { id: 'VEGAN', label: 'ソイ/植物性' },
    { id: 'BCAA', label: 'アミノ酸' },
    { id: 'ACCESSORIES', label: 'シェイカー等' },
  ];

  const navigateTo = (view: 'HOME' | 'GUIDE') => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white text-secondary selection:bg-primary selection:text-white font-sans">
      
      {/* Toast Notification */}
      <div className={`fixed top-24 right-5 z-50 bg-white border border-primary/30 text-secondary px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 transition-all duration-300 ${showToast ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="text-primary w-5 h-5" />
        <span className="font-medium text-sm">気になるリストに保存しました</span>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 border-b ${isScrolled || currentView === 'GUIDE' ? 'bg-white/95 backdrop-blur-md border-slate-100 py-3 shadow-sm' : 'bg-transparent border-transparent py-6'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => navigateTo('HOME')}>
            <span className="text-xl md:text-2xl font-black tracking-widest text-secondary group-hover:text-primary transition-colors">
              MITSUKERU
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide text-slate-600">
            <button onClick={() => { navigateTo('HOME'); setIsDiagnosisOpen(true); }} className="hover:text-primary transition-colors flex items-center">AI診断</button>
            <button onClick={() => navigateTo('GUIDE')} className={`transition-colors flex items-center ${currentView === 'GUIDE' ? 'text-primary' : 'hover:text-secondary'}`}>初心者ガイド</button>
            <button onClick={() => { navigateTo('HOME'); setTimeout(() => document.getElementById('ranking')?.scrollIntoView({behavior:'smooth'}), 100)}} className="hover:text-secondary transition-colors">商品一覧</button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-slate-600 hover:text-secondary transition-colors hidden sm:block" onClick={() => document.getElementById('search-input')?.focus()}>
              <Search className="w-5 h-5" />
            </button>
            <Button 
                variant="primary" 
                size="sm" 
                className="hidden md:flex"
                onClick={() => setIsDiagnosisOpen(true)}
            >
                無料診断スタート
            </Button>
            <button 
              className="relative p-2 text-secondary hover:text-primary transition-colors group"
              onClick={() => setIsSavedListOpen(true)}
            >
              <Bookmark className="w-6 h-6 group-hover:fill-current" />
              {savedItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {savedItems.length}
                </span>
              )}
            </button>
            <button className="md:hidden p-2 text-secondary">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Switching */}
      {currentView === 'GUIDE' ? (
        <ProteinGuide onBack={() => navigateTo('HOME')} />
      ) : (
        <>
          {/* Hero Section */}
          <header className="relative pt-32 pb-20 md:pt-48 md:pb-24 overflow-hidden bg-white">
            {/* Background Effects (Subtle Dodgers Blue) */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="container mx-auto px-4 relative z-10 text-center">
              <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 rounded-full px-6 py-2 mb-8 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setIsDiagnosisOpen(true)}>
                <span className="text-xs font-bold text-slate-600 tracking-wide group-hover:text-primary transition-colors">30秒で完了！AI診断はこちら</span>
              </div>
              
              <h1 className="font-black tracking-tighter mb-10 text-secondary">
                <span className="block text-3xl md:text-5xl leading-tight">
                  見つける、<span className="text-primary">マイプロテイン</span>。
                </span>
              </h1>
              
              <p className="text-slate-600 text-base md:text-xl max-w-2xl mx-auto mb-12 leading-8 md:leading-9 tracking-wide font-medium">
                あなたの「体質」と「目的」にベストマッチする商品を<span className="text-primary font-bold">AI</span>が分析。<br className="hidden md:block" />
                各ショップの価格をリアルタイム比較し、<span className="text-primary border-b-2 border-primary/30 pb-0.5 mx-1 font-bold">最安値</span>で賢く手に入れよう。
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-primary/40" onClick={() => setIsDiagnosisOpen(true)}>
                  今すぐ診断する
                </Button>
                <Button size="lg" variant="secondary" className="h-14 px-8 rounded-full w-full sm:w-auto shadow-xl shadow-slate-800/20" onClick={() => navigateTo('GUIDE')}>
                  プロテインの選び方
                </Button>
              </div>
            </div>
          </header>

          {/* AI診断結果の推薦商品セクション */}
          {showRecommendations && (
            <section id="recommendations" className="container mx-auto px-4 py-8 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-slate-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">AI診断結果</span>
                </div>
                <h2 className="text-2xl font-bold text-secondary mb-2">
                  あなたにおすすめのプロテイン
                </h2>
                <p className="text-slate-600">診断結果に基づいて、最適な商品を厳選しました</p>
              </div>
              
              {/* 推薦商品グリッド */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {recommendedProducts.map((product) => (
                  <ProductCard
                    key={product.id} 
                    product={product} 
                    onSave={toggleSave}
                    isSaved={savedItems.some(i => i.id === product.id)}
                    onOpenDetail={handleOpenDetail}
                  />
                ))}
              </div>
              
              {/* 他の商品も見る */}
              <div className="text-center">
                <button 
                  onClick={() => setShowRecommendations(false)}
                  className="text-primary hover:text-primaryDark font-semibold text-sm"
                >
                  他の商品も見る →
                </button>
              </div>
            </section>
          )}

          {/* Main Content Area */}
          <main id="ranking" className="container mx-auto px-4 py-8 bg-white min-h-[600px]">
            
            {/* Quick Filters - Connected Tabs Style */}
            <div className="mb-6 flex justify-center">
               <div className="bg-white p-1 rounded-full border border-slate-200 shadow-sm inline-flex">
                  {quickFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleQuickFilter(filter.id, filter.apply)}
                      className={`flex items-center px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                        activeTabId === filter.id 
                          ? 'bg-primary text-white shadow-md shadow-primary/20' 
                          : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
               </div>
            </div>

            {/* Search & Advanced Filter Section */}
            <div className="mb-8">
              <div className="flex flex-col gap-2">
                
                {/* Search Bar + Filter Toggle */}
                <div className="flex gap-2">
                   <div className="relative group flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-primary transition-colors" />
                      <input 
                        id="search-input"
                        type="text" 
                        placeholder="商品名、成分（WPIなど）で検索..." 
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (e.target.value) setActiveTabId('CUSTOM');
                        }}
                        className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base transition-shadow hover:shadow-md text-secondary"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                   </div>
                   <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`px-4 rounded-lg border font-bold flex items-center gap-2 transition-all ${isFilterOpen ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-secondary border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}`}
                   >
                     <SlidersHorizontal className="w-5 h-5" />
                     <span className="hidden sm:inline">絞り込み</span>
                   </button>
                </div>

                {/* Collapsible Filter Panel */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFilterOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-lg mt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Column 1: Categories */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">カテゴリを選択</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              setActiveTabId('CUSTOM');
                            }}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                              selectedCategory === cat.id
                                ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-1'
                                : 'bg-slate-100 text-secondary hover:bg-slate-200'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Price Range */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">価格範囲 (円)</h3>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">¥</span>
                          <input 
                            type="number" 
                            placeholder="下限なし" 
                            value={minPrice}
                            onChange={(e) => {
                              setMinPrice(e.target.value);
                              setActiveTabId('CUSTOM');
                            }}
                            className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-secondary"
                          />
                        </div>
                        <span className="text-slate-400">〜</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">¥</span>
                          <input 
                            type="number" 
                            placeholder="上限なし" 
                            value={maxPrice}
                            onChange={(e) => {
                              setMaxPrice(e.target.value);
                              setActiveTabId('CUSTOM');
                            }}
                            className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-secondary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Sort */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">並び替え</h3>
                      <div className="space-y-2">
                        <label className="flex items-center p-2 rounded hover:bg-slate-50 cursor-pointer">
                          <input 
                            type="radio" 
                            name="sort" 
                            checked={sortBy === 'RATING'} 
                            onChange={() => {
                              setSortBy('RATING');
                              setActiveTabId('CUSTOM');
                            }}
                            className="w-4 h-4 text-primary focus:ring-primary border-slate-300"
                          />
                          <span className="ml-2 text-sm text-secondary">評価が高い順 (人気)</span>
                        </label>
                        <label className="flex items-center p-2 rounded hover:bg-slate-50 cursor-pointer">
                          <input 
                            type="radio" 
                            name="sort" 
                            checked={sortBy === 'PRICE_ASC'} 
                            onChange={() => {
                              setSortBy('PRICE_ASC');
                              setActiveTabId('CUSTOM');
                            }}
                            className="w-4 h-4 text-primary focus:ring-primary border-slate-300"
                          />
                          <span className="ml-2 text-sm text-secondary">価格が安い順</span>
                        </label>
                        <label className="flex items-center p-2 rounded hover:bg-slate-50 cursor-pointer">
                          <input 
                            type="radio" 
                            name="sort" 
                            checked={sortBy === 'PRICE_DESC'} 
                            onChange={() => {
                              setSortBy('PRICE_DESC');
                              setActiveTabId('CUSTOM');
                            }}
                            className="w-4 h-4 text-primary focus:ring-primary border-slate-300"
                          />
                          <span className="ml-2 text-sm text-secondary">価格が高い順</span>
                        </label>
                      </div>
                    </div>

                  </div>
                  
                  {/* Active Filter Chips */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategory !== 'ALL' && (
                      <div className="inline-flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                        カテゴリ: {categories.find(c => c.id === selectedCategory)?.label}
                        <button onClick={() => setSelectedCategory('ALL')} className="ml-1 hover:text-primaryDark"><X className="w-3 h-3"/></button>
                      </div>
                    )}
                    {minPrice && (
                       <div className="inline-flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                        ¥{minPrice}以上
                        <button onClick={() => setMinPrice('')} className="ml-1 hover:text-primaryDark"><X className="w-3 h-3"/></button>
                      </div>
                    )}
                    {maxPrice && (
                       <div className="inline-flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                        ¥{maxPrice}以下
                        <button onClick={() => setMaxPrice('')} className="ml-1 hover:text-primaryDark"><X className="w-3 h-3"/></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid - Compact 2 columns on Mobile, 5 on Large Screens */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
                    <div className="aspect-[4/3] bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {displayProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onSave={toggleSave}
                    isSaved={savedItems.some(i => i.id === product.id)}
                    onOpenDetail={handleOpenDetail}
                  />
                ))}
              </div>
            )}

            {displayProducts.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <div className="inline-flex justify-center items-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                   <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-lg font-bold text-secondary mb-2">条件に一致する商品が見つかりませんでした。</p>
                <p className="text-slate-400 mb-6">検索キーワードを変えるか、フィルターをリセットしてください。</p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setMinPrice(''); setMaxPrice(''); setActiveTabId('POPULAR'); }}>すべての商品を表示</Button>
              </div>
            )}
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 text-sm border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <span className="text-lg font-bold">MITSUKERU</span>
            </div>
            <div className="flex space-x-6 text-slate-300">
              <a href="#" className="hover:text-white transition-colors">運営会社</a>
              <a href="#" className="hover:text-white transition-colors">掲載依頼（メーカー様）</a>
              <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
              <a href="#" className="hover:text-white transition-colors">お問い合わせ</a>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400">
            ※当サイトはアフィリエイトプログラムに参加しています。商品購入により一定の手数料を得る場合があります。<br/>
            &copy; 2024 MITSUKERU Media. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Saved Items Sidebar */}
      {isSavedListOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="bg-black/50 flex-1" onClick={() => setIsSavedListOpen(false)} />
          <div className="bg-white w-96 h-full overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-secondary">気になるリスト</h2>
              <button onClick={() => setIsSavedListOpen(false)}>
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
                      <h3 className="font-bold text-sm text-secondary mb-2">{item.name}</h3>
                      <p className="text-xs text-slate-500">保存日: {item.savedAt.toLocaleDateString()}</p>
                      <button 
                        onClick={() => removeSavedItem(item.id)}
                        className="text-red-500 text-xs mt-2 hover:text-red-700"
                      >
                        削除
                      </button>
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
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
        onComplete={handleDiagnosisComplete}
      />

      <AIChatWidget />
    </div>
  );
}