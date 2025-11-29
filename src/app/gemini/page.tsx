'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Search, Dumbbell, Zap, TrendingUp, Filter, Sparkles, BookOpen, X, ChevronDown, ArrowUpDown, SlidersHorizontal, Trophy, Coins, Tag } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { AIChatWidget } from '@/components/AIChatWidget';
import { AIDiagnosisModal } from '@/components/AIDiagnosisModal';
import { ProteinGuide } from '@/components/ProteinGuide';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { Button } from '@/components/ui/Button';
import { fetchProducts } from '@/lib/productService';

export default function GeminiPage() {
  const [currentView, setCurrentView] = useState<'HOME' | 'GUIDE'>('HOME');
  
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
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Product data
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // All products from API (160 products)
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(false);

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

  // Load all products from API
  const loadAllProducts = async () => {
    try {
      setIsLoadingAllProducts(true);
      
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success && data.categories) {
        // カテゴリから全商品を平坦化
        const flatProducts = data.categories.flatMap((cat: any) => 
          cat.products.map((product: any) => ({
            ...product,
            categoryName: cat.name,
            category: cat.category, // Add category field for filtering
            // Map API field names to frontend expected names
            image: product.imageUrl,
            rating: product.reviewAverage || 0,
            protein: product.nutrition?.protein || product.protein || 20,
            calories: product.nutrition?.calories || product.calories || 110,
            reviews: product.reviewCount || 0
          }))
        );
        
        setAllProducts(flatProducts);
        setShowAllProducts(true);
        
        console.log(`✅ 全商品データを読み込み (${data.source}):`, flatProducts.length, '商品');
        
        // 商品一覧セクションにスクロール
        setTimeout(() => {
          document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        console.error('❌ 全商品データ取得失敗:', data.error);
      }
    } catch (error) {
      console.error('❌ 全商品データ取得エラー:', error);
    } finally {
      setIsLoadingAllProducts(false);
    }
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
    const productPrice = p.price || (p.shops && p.shops.length > 0 ? Math.min(...p.shops.map(s => s.price)) : 0);
    if (minPrice && productPrice < Number(minPrice)) return false;
    if (maxPrice && productPrice > Number(maxPrice)) return false;
    
    return true;
  });

  // Sorting Logic
  displayProducts.sort((a, b) => {
    const minPriceA = a.price || (a.shops && a.shops.length > 0 ? Math.min(...a.shops.map(s => s.price)) : 0);
    const minPriceB = b.price || (b.shops && b.shops.length > 0 ? Math.min(...b.shops.map(s => s.price)) : 0);

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

            {/* Show More / All Products Section */}
            <div className="text-center mt-12 mb-12">
              {!showAllProducts ? (
                <Button
                  onClick={loadAllProducts}
                  disabled={isLoadingAllProducts}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg font-medium"
                >
                  {isLoadingAllProducts ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      商品を読み込み中...
                    </>
                  ) : (
                    <>
                      もっと見る
                      <ChevronDown className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAllProducts(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
                >
                  商品一覧を閉じる
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </main>

          {/* All Products Section */}
          {showAllProducts && (
            <div id="all-products" className="bg-gray-50 py-12">
              <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">全商品一覧</h2>
                  <p className="text-gray-600">楽天市場から厳選された{allProducts.length}商品を比較検討</p>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                      <input
                        type="text"
                        placeholder="商品名・ブランド名で検索"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Category Filter */}
                    <div>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="ALL">すべてのカテゴリ</option>
                        <option value="ranking_overall">人気ランキング総合</option>
                        <option value="cospa_ranking">コスパ最強ランキング</option>
                        <option value="soy">ソイプロテイン</option>
                        <option value="bulk">大容量プロテイン</option>
                        <option value="premium">プレミアムプロテイン</option>
                        <option value="brand_haleo">HALEOプロテイン</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                      >
                        <option value="RATING">評価が高い順</option>
                        <option value="PRICE_ASC">価格が安い順</option>
                        <option value="PRICE_DESC">価格が高い順</option>
                      </select>
                    </div>

                    {/* Results Count */}
                    <div>
                      <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium text-center">
                        {(() => {
                          let filteredProducts = allProducts;
                          if (selectedCategory !== 'ALL') {
                            filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
                          }
                          if (searchQuery) {
                            filteredProducts = filteredProducts.filter(p => 
                              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                            );
                          }
                          return `${filteredProducts.length}件表示中`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {(() => {
                    let filteredProducts = allProducts;
                    
                    // Category filter
                    if (selectedCategory !== 'ALL') {
                      filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
                    }
                    
                    // Search filter
                    if (searchQuery) {
                      filteredProducts = filteredProducts.filter(p => 
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                      );
                    }
                    
                    // Sort
                    if (sortBy === 'PRICE_ASC') {
                      filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
                    } else if (sortBy === 'PRICE_DESC') {
                      filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
                    } else if (sortBy === 'RATING') {
                      filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    }
                    
                    return filteredProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                          <img
                            src={product.image || '/placeholder-protein.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-protein.jpg'
                            }}
                          />
                        </div>

                        <div className="p-3">
                          <div className="text-xs text-blue-600 font-medium mb-1">{product.brand || 'その他'}</div>
                          
                          <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 h-10">
                            {product.name}
                          </h3>

                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                            <div>タンパク質: {product.protein || 20}g</div>
                            <div>カロリー: {product.calories || 110}kcal</div>
                          </div>

                          {product.rating > 0 && (
                            <div className="flex items-center mb-2">
                              <span className="text-yellow-400 text-sm">★{product.rating.toFixed(1)}</span>
                              <span className="text-xs text-gray-500 ml-1">({product.reviewCount || product.reviews || 0})</span>
                            </div>
                          )}

                          <div className="mb-3">
                            <div className="text-lg font-bold text-gray-900">¥{(product.price || 0).toLocaleString()}</div>
                            <div className="text-xs text-gray-500">1回分 ¥{product.pricePerServing || Math.round((product.price || 0) / 30)}</div>
                          </div>

                          <button
                            onClick={() => handleOpenDetail(product)}
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md text-center transition-colors"
                          >
                            詳細を見る
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* No results message */}
                {(() => {
                  let filteredProducts = allProducts;
                  if (selectedCategory !== 'ALL') {
                    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
                  }
                  if (searchQuery) {
                    filteredProducts = filteredProducts.filter(p => 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                    );
                  }
                  
                  if (filteredProducts.length === 0) {
                    return (
                      <div className="text-center py-20">
                        <div className="inline-flex justify-center items-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                          <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 mb-2">条件に一致する商品が見つかりませんでした。</p>
                        <p className="text-gray-600 mb-6">検索キーワードを変えるか、フィルターをリセットしてください。</p>
                        <Button 
                          variant="outline" 
                          onClick={() => { 
                            setSearchQuery(''); 
                            setSelectedCategory('ALL'); 
                          }}
                        >
                          フィルターをリセット
                        </Button>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
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


      {/* AI Diagnosis Modal */}
      <AIDiagnosisModal 
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
        onComplete={handleDiagnosisComplete}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal 
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <AIChatWidget />
    </div>
  );
}