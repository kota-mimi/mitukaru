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

// 元のGeminiのPRODUCTSデータを完全再現
function getSampleProducts(): Product[] {
  return [
    {
      id: '1',
      name: 'タイタン・ホエイ・ゴールド',
      description: '超高純度加水分解ホエイ。吸収速度最速で、筋トレ直後のゴールデンタイムに最適。',
      image: 'https://picsum.photos/seed/whey1/500/500',
      category: 'WHEY',
      rating: 4.8,
      reviews: 1240,
      tags: ['ベストセラー', '筋肥大', 'ランキング1位'],
      shops: [
        { name: 'Rakuten', price: 6800, url: '#' },
        { name: 'Amazon', price: 6950, url: '#' },
        { name: 'Official', price: 7200, url: '#' },
      ],
      specs: {
        proteinRatio: 85,
        flavor: 'ダブルリッチチョコ',
        weight: '1kg',
        weightGrams: 1000
      },
      flavorProfile: {
        sweetness: 4,
        acidity: 1,
        richness: 5,
        solubility: 5
      },
      reviewList: [
        { id: 'r1', user: '筋トレ歴3年', rating: 5, comment: 'とにかく美味しい。水で割っても薄くないし、デザート感覚で飲める。', date: '2024/02/10' },
        { id: 'r2', user: 'ジム通いマン', rating: 4, comment: '値段は少し高いが、成分が良いのでリピート。溶けやすさは抜群。', date: '2024/01/25' }
      ]
    },
    {
      id: '2',
      name: 'ナイトリカバリー・カゼイン',
      description: '就寝中に持続的に栄養補給。カタボリックを防ぎ、朝の目覚めを変える。',
      image: 'https://picsum.photos/seed/casein1/500/500',
      category: 'CASEIN',
      rating: 4.6,
      reviews: 850,
      tags: ['就寝前', 'ダイエット', '腹持ち良し'],
      shops: [
        { name: 'Rakuten', price: 5400, url: '#' },
        { name: 'Amazon', price: 5200, url: '#' },
      ],
      specs: {
        proteinRatio: 78,
        flavor: 'バニラドリーム',
        weight: '1kg',
        weightGrams: 1000
      },
      flavorProfile: {
        sweetness: 5,
        acidity: 1,
        richness: 4,
        solubility: 3
      },
      reviewList: [
        { id: 'r1', user: 'ダイエット中', rating: 5, comment: '腹持ちが良いので夜食の代わりに最適。甘くて満足感がある。', date: '2024/03/01' }
      ]
    },
    {
      id: '3',
      name: 'コスパ最強 WPC 3kg',
      description: '毎日飲むならこれ。国内製造で安心かつ圧倒的な低価格を実現した高コスパプロテイン。',
      image: 'https://picsum.photos/seed/bulk/500/500',
      category: 'WHEY',
      rating: 4.3,
      reviews: 3200,
      tags: ['コスパ最強', '大容量', '学生に人気'],
      shops: [
        { name: 'Rakuten', price: 7980, url: '#' },
        { name: 'Amazon', price: 8500, url: '#' },
      ],
      specs: {
        proteinRatio: 72,
        flavor: 'ミルクココア',
        weight: '3kg',
        weightGrams: 3000
      },
      flavorProfile: {
        sweetness: 3,
        acidity: 1,
        richness: 3,
        solubility: 4
      },
      reviewList: [
        { id: 'r1', user: '学生トレーニー', rating: 5, comment: 'この量でこの値段は神。味も普通に美味しいココア。', date: '2024/02/28' },
        { id: 'r2', user: 'コスパ重視', rating: 4, comment: '少し泡立ちが多い気がするが、安いので許容範囲。', date: '2024/02/15' }
      ]
    },
    {
      id: '4',
      name: 'ソイ・ビューティー・プロ',
      description: '美容成分配合のソイプロテイン。イソフラボン効果で女性の美ボディメイクを強力サポート。',
      image: 'https://picsum.photos/seed/soy1/500/500',
      category: 'VEGAN',
      rating: 4.7,
      reviews: 620,
      tags: ['女性に人気', '美容', '低脂質'],
      shops: [
        { name: 'Rakuten', price: 3980, url: '#' },
        { name: 'Official', price: 3500, url: '#' },
      ],
      specs: {
        proteinRatio: 75,
        flavor: '黒糖ミルク',
        weight: '750g',
        weightGrams: 750
      },
      flavorProfile: {
        sweetness: 4,
        acidity: 1,
        richness: 2,
        solubility: 3
      },
      reviewList: [
        { id: 'r1', user: '美容オタク', rating: 5, comment: '粉っぽさが少なくて飲みやすい！豆乳で割るとスタバみたい。', date: '2024/03/05' }
      ]
    },
    {
      id: '5',
      name: 'リーンボディ・アイソレート',
      description: '脂質・糖質を極限までカット。減量中、コンテスト前のストイックなアスリートへ。',
      image: 'https://picsum.photos/seed/iso1/500/500',
      category: 'WHEY',
      rating: 4.9,
      reviews: 430,
      tags: ['減量', 'トップアスリート', 'WPI'],
      shops: [
        { name: 'Amazon', price: 8200, url: '#' },
        { name: 'Official', price: 8200, url: '#' },
      ],
      specs: {
        proteinRatio: 92,
        flavor: 'クリアフルーツ',
        weight: '1kg',
        weightGrams: 1000
      },
      flavorProfile: {
        sweetness: 2,
        acidity: 4,
        richness: 1,
        solubility: 5
      },
      reviewList: [
        { id: 'r1', user: 'フィジーカー', rating: 5, comment: 'ジュースみたいにゴクゴク飲める。トレ後に甘ったるいのが苦手な人に最高。', date: '2024/02/20' }
      ]
    },
    {
      id: '6',
      name: 'バルクアップ・ゲイナーEX',
      description: '太りたいのに太れない人へ。吸収の良い炭水化物とプロテインの黄金比率。',
      image: 'https://picsum.photos/seed/gainer/500/500',
      category: 'WHEY',
      rating: 4.4,
      reviews: 350,
      tags: ['増量', 'ハードゲイナー', '高カロリー'],
      shops: [
        { name: 'Rakuten', price: 4500, url: '#' },
        { name: 'Amazon', price: 4400, url: '#' },
      ],
      specs: {
        proteinRatio: 30,
        flavor: '濃厚バナナ',
        weight: '3kg',
        weightGrams: 3000
      },
      flavorProfile: {
        sweetness: 5,
        acidity: 1,
        richness: 5,
        solubility: 3
      },
      reviewList: [
        { id: 'r1', user: '増量中', rating: 4, comment: 'かなり甘い。カロリーを摂るためと割り切って飲んでいる。体重は増えた。', date: '2024/01/15' }
      ]
    },
    {
      id: '7',
      name: 'EAA 9 必須アミノ酸',
      description: 'プロテインより早い吸収。トレーニング中の血中アミノ酸濃度を維持し、筋肉分解を防ぐ。',
      image: 'https://picsum.photos/seed/eaa/500/500',
      category: 'BCAA',
      rating: 4.8,
      reviews: 980,
      tags: ['セール中', '中級者向け', '疲労回復'],
      shops: [
        { name: 'Rakuten', price: 5980, url: '#' },
        { name: 'Amazon', price: 6200, url: '#' },
      ],
      specs: {
        proteinRatio: 100,
        flavor: 'ピンクグレープフルーツ',
        weight: '500g',
        weightGrams: 500
      },
      flavorProfile: {
        sweetness: 3,
        acidity: 5,
        richness: 1,
        solubility: 5
      },
      reviewList: [
        { id: 'r1', user: 'トレーニー', rating: 5, comment: 'トレーニング中のドリンクとして最適。苦味が抑えられていて美味しい。', date: '2024/03/02' }
      ]
    },
    {
      id: '8',
      name: 'スマートシェイカー V2',
      description: 'プロテインとサプリメントケースが一体化。ダマにならない特許技術のブレンダーボール付き。',
      image: 'https://picsum.photos/seed/shaker/500/500',
      category: 'ACCESSORIES',
      rating: 4.5,
      reviews: 150,
      tags: ['便利グッズ', '持ち運び'],
      shops: [
        { name: 'Rakuten', price: 1500, url: '#' },
        { name: 'Amazon', price: 1200, url: '#' },
      ],
      specs: {
        proteinRatio: 0,
        flavor: '-',
        weight: '600ml',
        weightGrams: 0
      },
      reviewList: []
    },
  ];
}