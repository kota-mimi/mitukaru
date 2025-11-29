import { Product } from '@/types';

// API経由でプロテイン商品を取得する関数
export async function fetchProducts(options: {
  keyword?: string;
  category?: string;
  page?: number;
} = {}): Promise<Product[]> {
  try {
    const { keyword = 'プロテイン', category = 'ALL', page = 1 } = options;
    
    // 楽天APIから商品データを取得
    const response = await fetch(`/api/rakuten?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.products) {
      throw new Error('Failed to fetch products');
    }
    
    // 楽天APIのレスポンスをGemini UI用のProduct型に変換
    const products: Product[] = data.products.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      image: item.imageUrl || '',
      category: mapTypeToCategory(item.type?.[0] || ''),
      rating: item.reviewAverage || 4.0,
      reviews: item.reviewCount || 0,
      tags: item.tags || [],
      shops: [
        {
          name: 'Rakuten' as const,
          price: item.price || 0,
          url: item.affiliateUrl || item.url || '#'
        }
      ],
      specs: {
        proteinRatio: extractProteinRatio(item.features?.protein, item.name),
        flavor: extractFlavor(item.name),
        weight: extractWeight(item.name),
        weightGrams: extractWeightGrams(item.name)
      }
    }));
    
    // カテゴリでフィルタリング
    if (category !== 'ALL') {
      return products.filter(product => product.category === category);
    }
    
    return products;
    
  } catch (error) {
    console.error('Product fetch error:', error);
    // エラー時はサンプルデータを返す
    return getSampleProducts();
  }
}

// 楽天APIのプロテインタイプをGemini UIのカテゴリにマップ
function mapTypeToCategory(type: string): 'WHEY' | 'CASEIN' | 'VEGAN' | 'BCAA' | 'ACCESSORIES' {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('ホエイ') || lowerType.includes('whey')) {
    return 'WHEY';
  }
  if (lowerType.includes('カゼイン') || lowerType.includes('casein')) {
    return 'CASEIN';
  }
  if (lowerType.includes('ソイ') || lowerType.includes('soy') || lowerType.includes('植物性')) {
    return 'VEGAN';
  }
  
  return 'WHEY'; // デフォルトはホエイ
}

// 商品名からプロテイン含有率を抽出
function extractProteinRatio(proteinContent: number | undefined, itemName: string): number {
  if (proteinContent) {
    // 30g中のタンパク質量から比率を計算
    return Math.round((proteinContent / 30) * 100);
  }
  
  // 商品名からプロテイン比率を推定
  const match = itemName.match(/(\d+)%|(\d+)％/);
  if (match) {
    return parseInt(match[1] || match[2]);
  }
  
  // タイプ別デフォルト値
  if (itemName.includes('WPI') || itemName.includes('アイソレート')) return 90;
  if (itemName.includes('ホエイ') || itemName.includes('whey')) return 75;
  if (itemName.includes('ソイ') || itemName.includes('soy')) return 80;
  
  return 75; // デフォルト値
}

// 商品名から味を抽出
function extractFlavor(itemName: string): string {
  const flavors = [
    'チョコ', 'ココア', 'チョコレート',
    'バニラ', 'ストロベリー', 'いちご',
    'バナナ', 'プレーン', '無味',
    'ミルクティー', '抹茶', 'ヨーグルト',
    'パイン', 'マンゴー', 'ピーチ'
  ];
  
  for (const flavor of flavors) {
    if (itemName.includes(flavor)) {
      return flavor;
    }
  }
  
  return 'チョコ'; // デフォルト
}

// 商品名から重量を抽出
function extractWeight(itemName: string): string {
  const match = itemName.match(/(\d+(?:\.\d+)?)kg|(\d+)g/i);
  if (match) {
    const weight = parseFloat(match[1] || match[2]);
    if (match[1]) { // kg
      return `${weight}kg`;
    } else { // g
      return `${weight}g`;
    }
  }
  
  return '1kg'; // デフォルト値
}

// 商品名から重量をグラム数で抽出
function extractWeightGrams(itemName: string): number {
  const match = itemName.match(/(\d+(?:\.\d+)?)kg|(\d+)g/i);
  if (match) {
    const weight = parseFloat(match[1] || match[2]);
    if (match[1]) { // kg
      return weight * 1000;
    } else { // g
      return weight;
    }
  }
  
  return 1000; // デフォルト値（1kg）
}

// サンプルデータ（API接続失敗時のフォールバック）
function getSampleProducts(): Product[] {
  return [
    {
      id: '1',
      name: 'ザバス ホエイプロテイン100 ココア味',
      description: '吸収の良いホエイプロテインを100%使用。筋肉づくりに欠かせない必須アミノ酸とビタミンB群を配合。',
      image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop',
      category: 'WHEY',
      rating: 4.5,
      reviews: 1234,
      tags: ['ランキング1位', '初心者おすすめ', '国産'],
      shops: [
        { name: 'Rakuten', price: 3980, url: '#' },
        { name: 'Amazon', price: 4200, url: '#' }
      ],
      specs: {
        proteinRatio: 75,
        flavor: 'ココア',
        weight: '1050g',
        weightGrams: 1050
      }
    },
    {
      id: '2',
      name: 'ソイプロテイン プレーン味 無添加',
      description: '植物性プロテイン100%使用。人工甘味料・香料不使用で自然な味わい。',
      image: 'https://images.unsplash.com/photo-1571770095004-6b61b1cf308a?w=400&h=300&fit=crop',
      category: 'VEGAN',
      rating: 4.2,
      reviews: 567,
      tags: ['女性人気', 'ヴィーガン', '無添加'],
      shops: [
        { name: 'Official', price: 2980, url: '#' },
        { name: 'Amazon', price: 3200, url: '#' }
      ],
      specs: {
        proteinRatio: 80,
        flavor: 'プレーン',
        weight: '1000g',
        weightGrams: 1000
      }
    },
    {
      id: '3',
      name: 'ビーレジェンド ホエイプロテイン 南国パイン風味',
      description: 'コスパに優れたホエイプロテイン。美味しさとコストパフォーマンスを追求。',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
      category: 'WHEY',
      rating: 4.6,
      reviews: 2890,
      tags: ['コスパ最強', '美味しい', '初心者向け'],
      shops: [
        { name: 'Official', price: 3480, url: '#' },
        { name: 'Rakuten', price: 3580, url: '#' }
      ],
      specs: {
        proteinRatio: 73,
        flavor: 'パイン',
        weight: '1kg',
        weightGrams: 1000
      }
    }
  ];
}