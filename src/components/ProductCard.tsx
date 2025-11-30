'use client';

import React from 'react';
import { Star, ExternalLink, Bookmark, Info } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  // 基本データ検証
  if (!product || !product.id || !product.name) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-xs text-gray-500">商品データが不正です</p>
      </div>
    );
  }

  try {
    // 最安値を取得（楽天APIからのpriceプロパティ優先）
    const minPrice = product.price || (product.shops && product.shops.length > 0 ? Math.min(...product.shops.map(s => s.price || 0)) : 0);

    // タンパク質1gあたりの価格計算 (楽天APIデータ対応)
    let pricePerProtein = 0;
    const proteinPerServing = product.protein || (product.features?.protein) || 20; // 1回分のタンパク質
    const servings = product.servings || (product.features?.servings) || 30; // 総回数
    const totalProtein = proteinPerServing * servings; // 総タンパク質量
    
    if (totalProtein > 0) {
      pricePerProtein = Math.round((minPrice / totalProtein) * 10) / 10;
    }

  return (
    <div 
      className="group relative bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 flex flex-col h-full cursor-pointer"
      onClick={() => onOpenDetail && onOpenDetail(product)}
    >
      
      {/* Ranking/Badge (Accent Red - Jersey Number Color) */}
      {product.tags && Array.isArray(product.tags) && product.tags.includes('ランキング1位') && (
        <div className="absolute top-0 left-0 z-10 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-br-lg shadow-md">
          No.1 👑
        </div>
      )}


      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden relative bg-slate-50">
        <img 
          src={product.image || '/placeholder-protein.svg'} 
          alt={product.name || 'プロテイン商品'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-protein.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent"></div>

        <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap pr-2">
          {(product.tags && Array.isArray(product.tags) ? product.tags : []).slice(0, 2).map(tag => (
             <span key={tag} className="text-[10px] font-bold bg-white/95 text-slate-800 px-1.5 py-0.5 rounded backdrop-blur-sm border border-slate-100 shadow-sm">
               {tag}
             </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center space-x-1 mb-1">
          {/* 星を黄色に */}
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-slate-800 font-bold">{product.rating || 0}</span>
          <span className="text-xs text-slate-400">({product.reviews || 0})</span>
        </div>

        <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[3em]">
          {product.name}
        </h3>


        <div className="mt-auto pt-2 flex flex-col gap-2">
          {/* Analysis Link */}
          <div className="text-[10px] text-center text-slate-300 group-hover:text-primary transition-colors flex items-center justify-center gap-0.5 mb-1">
             <Info className="w-3 h-3" />
             詳細・成分分析
          </div>

          {/* Direct Shop Links - Clean Text Style */}
          <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
            {product.shops && product.shops.length > 0 ? product.shops.map((shop) => (
              <a 
                key={shop.name}
                href={shop.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-1 pl-2 rounded bg-white border border-slate-200 hover:border-primary/50 transition-all group/btn shadow-sm"
              >
                 <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      shop.name === 'Rakuten' ? 'bg-[#BF0000]' : 
                      shop.name === 'Amazon' ? 'bg-[#FF9900]' : 
                      'bg-blue-500'
                    }`} />
                    <span className="text-xs font-bold text-slate-600 leading-none">
                      {shop.name === 'Official' ? '公式' : shop.name}
                    </span>
                 </div>
                 
                 {/* Price Text: Dark text for visibility */}
                 <div className="flex items-center gap-1 px-2 py-0.5 font-mono font-bold text-xs leading-none text-slate-900">
                    ¥{shop.price.toLocaleString()}
                    <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover/btn:opacity-100 group-hover/btn:text-primary" />
                 </div>
              </a>
            )) : (
              <a 
                href={product.affiliateUrl || product.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-1 pl-2 rounded bg-white border border-slate-200 hover:border-primary/50 transition-all group/btn shadow-sm"
              >
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#BF0000]" />
                    <span className="text-xs font-bold text-slate-600 leading-none">楽天</span>
                 </div>
                 
                 <div className="flex items-center gap-1 px-2 py-0.5 font-mono font-bold text-xs leading-none text-slate-900">
                    ¥{minPrice.toLocaleString()}
                    <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover/btn:opacity-100 group-hover/btn:text-primary" />
                 </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('ProductCard描画エラー:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-xs text-red-600">商品表示エラー</p>
        <p className="text-xs text-gray-500 mt-1">{product.name || 'Unknown'}</p>
      </div>
    );
  }
};