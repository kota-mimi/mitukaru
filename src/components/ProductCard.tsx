'use client';

import React from 'react';
import { Star, ExternalLink, Bookmark, Info } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onSave: (product: Product) => void;
  isSaved?: boolean;
  onOpenDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSave, isSaved = false, onOpenDetail }) => {
  // 最安値を取得
  const minPrice = Math.min(...product.shops.map(s => s.price));

  // タンパク質1gあたりの価格計算 (簡易)
  let pricePerProtein = 0;
  if (product.specs.proteinRatio > 0 && product.specs.weightGrams > 0) {
    const totalProtein = product.specs.weightGrams * (product.specs.proteinRatio / 100);
    pricePerProtein = Math.round((minPrice / totalProtein) * 10) / 10;
  }

  return (
    <div 
      className="group relative bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 flex flex-col h-full cursor-pointer"
      onClick={() => onOpenDetail && onOpenDetail(product)}
    >
      
      {/* Ranking/Badge (Accent Red - Jersey Number Color) */}
      {product.tags.includes('ランキング1位') && (
        <div className="absolute top-0 left-0 z-10 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-br-lg shadow-md">
          No.1 👑
        </div>
      )}

      {/* Save Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onSave(product); }}
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-colors shadow-sm ${
          isSaved 
            ? 'bg-white text-primary shadow-primary/20' 
            : 'bg-white/90 text-slate-400 hover:text-primary hover:bg-white'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden relative bg-slate-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent"></div>

        <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap pr-2">
          {product.tags.slice(0, 2).map(tag => (
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
          <span className="text-sm text-slate-800 font-bold">{product.rating}</span>
          <span className="text-xs text-slate-400">({product.reviews})</span>
        </div>

        <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[3em]">
          {product.name}
        </h3>

        {/* Specs Mini Table */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded border border-slate-100">
          {/* タンパク質を緑色に */}
          <div>タンパク質: <span className="text-green-600 font-bold">{product.specs.proteinRatio}%</span></div>
          {/* コスパを赤色に */}
          <div>コスパ: 
            {pricePerProtein > 0 ? (
               <span className="text-red-600 font-bold ml-1">¥{pricePerProtein}/g</span>
            ) : <span className="text-slate-400">-</span>}
          </div>
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-2">
          {/* Analysis Link */}
          <div className="text-[10px] text-center text-slate-300 group-hover:text-primary transition-colors flex items-center justify-center gap-0.5 mb-1">
             <Info className="w-3 h-3" />
             詳細・成分分析
          </div>

          {/* Direct Shop Links - Clean Text Style */}
          <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
            {product.shops.map((shop) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};