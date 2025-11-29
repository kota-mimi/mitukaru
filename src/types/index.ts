export interface ShopPrice {
  name: 'Rakuten' | 'Amazon' | 'Official';
  price: number;
  url: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: 'WHEY' | 'CASEIN' | 'VEGAN' | 'BCAA' | 'ACCESSORIES';
  rating: number;
  reviews: number;
  tags: string[];
  // アフィリエイト・比較用データ
  shops: ShopPrice[];
  specs: {
    proteinRatio: number; // タンパク質含有率 %
    flavor: string;
    weight: string;
    weightGrams: number; // 計算用グラム数
  };
  // 詳細分析データ
  flavorProfile?: {
    sweetness: number; // 1-5
    acidity: number;   // 1-5
    richness: number;  // 1-5 (濃厚さ)
    solubility: number; // 1-5 (溶けやすさ)
  };
  reviewList?: Review[];
}

// カートの代わりに「気になるリスト」として使用
export interface SavedItem extends Product {
  savedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface DiagnosisResult {
  recommendedProductIds: string[];
  advice: string;
}