// ダミープロテインデータ（複数ECサイト対応）
export const dummyProteins = [
  {
    id: 'savas_whey_chocolate_1',
    name: 'ザバス ホエイプロテイン100 リッチショコラ味 980g',
    brand: 'ザバス',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/kenkocom/cabinet/102/4902777302102.jpg',
    reviewAverage: 4.64,
    reviewCount: 1329,
    description: 'たんぱく原料として吸収が良いホエイプロテインのみを採用。理想的なカラダづくりをサポート。',
    nutrition: {
      protein: 19.5,
      calories: 108,
      servings: 35,
      servingSize: 28
    },
    type: 'ホエイ',
    flavor: 'チョコレート',
    platforms: [
      {
        platform: 'rakuten',
        price: 4815,
        pricePerServing: 172,
        originalPrice: 5200,
        shopName: '楽天24',
        affiliateUrl: 'https://item.rakuten.co.jp/kenkocom/e535922h/',
        stock: {
          status: '在庫あり',
          quantity: 50,
          lowStock: false
        },
        shipping: {
          freeShipping: true,
          deliveryDays: '翌日配送',
          shippingCost: 0
        },
        sale: {
          onSale: true,
          discountRate: 7,
          saleEndTime: '2025-11-30T23:59:59'
        }
      },
      {
        platform: 'amazon',
        price: 4650,
        pricePerServing: 166,
        originalPrice: 4650,
        shopName: 'Amazon.co.jp',
        affiliateUrl: 'https://amazon.co.jp/savas-whey-chocolate',
        stock: {
          status: '在庫あり',
          quantity: 12,
          lowStock: false
        },
        shipping: {
          freeShipping: true,
          deliveryDays: '翌日配送',
          shippingCost: 0
        },
        sale: {
          onSale: false,
          discountRate: 0,
          saleEndTime: null
        }
      },
      {
        platform: 'yahoo',
        price: 4890,
        pricePerServing: 175,
        originalPrice: 4890,
        shopName: 'Yahoo!ショッピング',
        affiliateUrl: 'https://shopping.yahoo.co.jp/savas-whey',
        stock: {
          status: '在庫あり',
          quantity: 25,
          lowStock: false
        },
        shipping: {
          freeShipping: false,
          deliveryDays: '2-3日',
          shippingCost: 550
        },
        sale: {
          onSale: false,
          discountRate: 0,
          saleEndTime: null
        }
      }
    ],
    bestPrice: {
      platform: 'amazon',
      price: 4650,
      pricePerServing: 166,
      originalPrice: 4650,
      shopName: 'Amazon.co.jp',
      affiliateUrl: 'https://amazon.co.jp/savas-whey-chocolate',
      stock: {
        status: '在庫あり',
        quantity: 12,
        lowStock: false
      },
      shipping: {
        freeShipping: true,
        deliveryDays: '翌日配送',
        shippingCost: 0
      },
      sale: {
        onSale: false,
        discountRate: 0,
        saleEndTime: null
      }
    }
  },
  {
    id: 'explosion_wpc_chocolate_1',
    name: 'プロテイン WPC エクスプロージョン 3kg ミルクチョコレート味',
    brand: 'エクスプロージョン',
    price: 8399,
    pricePerServing: 84,
    originalPrice: 8999,
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/x-plosion/cabinet/yec/11362306/241227_10000019.jpg',
    shopName: 'X-PLOSION 公式',
    reviewAverage: 4.47,
    reviewCount: 1984,
    description: '有名店のような絶品のチョコレート風味。100%ナチュラルホエイプロテイン。',
    affiliateUrl: 'https://item.rakuten.co.jp/x-plosion/10000019/',
    nutrition: {
      protein: 21.0,
      calories: 116,
      servings: 100,
      servingSize: 30
    },
    type: 'ホエイ',
    flavor: 'チョコレート',
    source: 'rakuten',
    stock: {
      status: '残りわずか',
      quantity: 3,
      lowStock: true
    },
    shipping: {
      freeShipping: true,
      deliveryDays: '2-3日',
      shippingCost: 0
    },
    sale: {
      onSale: true,
      discountRate: 6,
      saleEndTime: '2025-12-15T23:59:59'
    }
  },
  {
    id: 'vitas_protein_strawberry_1',
    name: 'プロテイン VITAS 1kg ストロベリーヨーグルト',
    brand: 'VITAS',
    price: 4680,
    pricePerServing: 156,
    originalPrice: 4680,
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/toyomarket/cabinet/campaign/nail/dp.jpg',
    shopName: 'VITAS 楽天市場店',
    reviewAverage: 4.78,
    reviewCount: 3530,
    description: '「美味しさ」と「含有成分」の両方にこだわった理想のカラダをつくるホエイプロテイン',
    affiliateUrl: 'https://item.rakuten.co.jp/toyomarket/vitas006/',
    nutrition: {
      protein: 21.4,
      calories: 126,
      servings: 30,
      servingSize: 32
    },
    type: 'ホエイ',
    flavor: 'ストロベリー',
    source: 'rakuten',
    stock: {
      status: '在庫あり',
      quantity: 25,
      lowStock: false
    },
    shipping: {
      freeShipping: true,
      deliveryDays: '翌日配送',
      shippingCost: 0
    },
    sale: {
      onSale: false,
      discountRate: 0,
      saleEndTime: null
    }
  },
  {
    id: 'dns_soy_protein_plain_1',
    name: 'DNS ソイプロテイン 1kg プレーン味',
    brand: 'DNS',
    price: 5800,
    pricePerServing: 145,
    originalPrice: 6200,
    imageUrl: 'https://example.com/dns-soy.jpg',
    shopName: 'DNS公式ショップ',
    reviewAverage: 4.2,
    reviewCount: 567,
    description: '植物性タンパク質100%。ダイエット・美容に最適なソイプロテイン。',
    affiliateUrl: 'https://example.com/dns-soy',
    nutrition: {
      protein: 16.8,
      calories: 95,
      servings: 40,
      servingSize: 25
    },
    type: 'ソイ',
    flavor: 'プレーン',
    source: 'rakuten',
    stock: {
      status: '在庫あり',
      quantity: 12,
      lowStock: false
    },
    shipping: {
      freeShipping: false,
      deliveryDays: '3-5日',
      shippingCost: 550
    },
    sale: {
      onSale: true,
      discountRate: 6,
      saleEndTime: '2025-12-01T23:59:59'
    }
  },
  {
    id: 'belegend_whey_banana_1',
    name: 'ビーレジェンド ホエイプロテイン バナナ風味 1kg',
    brand: 'ビーレジェンド',
    price: 3980,
    pricePerServing: 119,
    originalPrice: 3980,
    imageUrl: 'https://example.com/belegend-banana.jpg',
    shopName: 'ビーレジェンド公式',
    reviewAverage: 4.5,
    reviewCount: 2100,
    description: 'コスパ最強！美味しくて続けやすいバナナ風味のホエイプロテイン。',
    affiliateUrl: 'https://example.com/belegend-banana',
    nutrition: {
      protein: 20.8,
      calories: 112,
      servings: 33,
      servingSize: 30
    },
    type: 'ホエイ',
    flavor: 'バナナ',
    source: 'rakuten',
    stock: {
      status: '在庫あり',
      quantity: 88,
      lowStock: false
    },
    shipping: {
      freeShipping: true,
      deliveryDays: '翌日配送',
      shippingCost: 0
    },
    sale: {
      onSale: false,
      discountRate: 0,
      saleEndTime: null
    }
  },
  {
    id: 'alpron_soy_strawberry_1',
    name: 'アルプロン ソイプロテイン いちご味 1kg',
    brand: 'アルプロン',
    price: 3680,
    pricePerServing: 92,
    originalPrice: 4080,
    imageUrl: 'https://example.com/alpron-strawberry.jpg',
    shopName: 'アルプロン楽天市場店',
    reviewAverage: 4.3,
    reviewCount: 890,
    description: '女性に人気！美容成分配合のいちご味ソイプロテイン。',
    affiliateUrl: 'https://example.com/alpron-strawberry',
    nutrition: {
      protein: 17.2,
      calories: 89,
      servings: 40,
      servingSize: 25
    },
    type: 'ソイ',
    flavor: 'ストロベリー',
    source: 'rakuten',
    stock: {
      status: '在庫あり',
      quantity: 35,
      lowStock: false
    },
    shipping: {
      freeShipping: true,
      deliveryDays: '2-3日',
      shippingCost: 0
    },
    sale: {
      onSale: true,
      discountRate: 10,
      saleEndTime: '2025-11-29T23:59:59'
    }
  },
  {
    id: 'myprotein_whey_vanilla_1',
    name: 'マイプロテイン ホエイプロテイン バニラ味 2.5kg',
    brand: 'マイプロテイン',
    price: 7200,
    pricePerServing: 86,
    originalPrice: 7800,
    imageUrl: 'https://example.com/myprotein-vanilla.jpg',
    shopName: 'マイプロテイン公式',
    reviewAverage: 4.1,
    reviewCount: 5600,
    description: 'ヨーロッパ売上No.1ブランド。高品質なバニラ風味ホエイプロテイン。',
    affiliateUrl: 'https://example.com/myprotein-vanilla',
    nutrition: {
      protein: 22.1,
      calories: 103,
      servings: 83,
      servingSize: 30
    },
    type: 'ホエイ',
    flavor: 'バニラ',
    source: 'rakuten',
    stock: {
      status: '在庫あり',
      quantity: 42,
      lowStock: false
    },
    shipping: {
      freeShipping: true,
      deliveryDays: '2-3日',
      shippingCost: 0
    },
    sale: {
      onSale: false,
      discountRate: 0,
      saleEndTime: null
    }
  },
  {
    id: 'savas_soy_cocoa_1',
    name: 'ザバス ソイプロテイン100 ココア味 945g',
    brand: 'ザバス',
    price: 4200,
    pricePerServing: 157,
    originalPrice: 4200,
    imageUrl: 'https://example.com/savas-soy-cocoa.jpg',
    shopName: '楽天24',
    reviewAverage: 4.4,
    reviewCount: 780,
    description: '引き締まったカラダづくりに。植物性タンパク質100%のココア味。',
    affiliateUrl: 'https://example.com/savas-soy-cocoa',
    nutrition: {
      protein: 15.0,
      calories: 79,
      servings: 45,
      servingSize: 21
    },
    type: 'ソイ',
    flavor: 'ココア',
    source: 'rakuten',
    stock: {
      status: '予約受付中',
      quantity: 0,
      lowStock: true
    },
    shipping: {
      freeShipping: true,
      deliveryDays: '1週間',
      shippingCost: 0
    },
    sale: {
      onSale: false,
      discountRate: 0,
      saleEndTime: null
    }
  },
  {
    id: 'kentai_whey_coffee_1',
    name: 'Kentai ホエイプロテイン カフェオレ風味 1kg',
    brand: 'Kentai',
    price: 5400,
    pricePerServing: 162,
    originalPrice: 5400,
    imageUrl: 'https://example.com/kentai-coffee.jpg',
    shopName: '健康体力研究所',
    reviewAverage: 4.3,
    reviewCount: 450,
    description: '朝食にぴったり！カフェオレ風味で美味しく続けられる。',
    affiliateUrl: 'https://example.com/kentai-coffee',
    nutrition: {
      protein: 18.7,
      calories: 105,
      servings: 33,
      servingSize: 30
    },
    type: 'ホエイ',
    flavor: 'コーヒー',
    source: 'rakuten',
    stock: {
      status: '在庫あり',
      quantity: 15,
      lowStock: false
    },
    shipping: {
      freeShipping: false,
      deliveryDays: '3-5日',
      shippingCost: 550
    },
    sale: {
      onSale: false,
      discountRate: 0,
      saleEndTime: null
    }
  },
  {
    id: 'haleo_casein_vanilla_1',
    name: 'HALEO カゼインプロテイン バニラ風味 750g',
    brand: 'HALEO',
    price: 6800,
    pricePerServing: 227,
    originalPrice: 7300,
    imageUrl: 'https://example.com/haleo-casein.jpg',
    shopName: 'HALEO公式ストア',
    reviewAverage: 4.6,
    reviewCount: 280,
    description: 'ゆっくり吸収されるカゼインプロテイン。就寝前におすすめ。',
    affiliateUrl: 'https://example.com/haleo-casein',
    nutrition: {
      protein: 24.0,
      calories: 120,
      servings: 30,
      servingSize: 25
    },
    type: 'カゼイン',
    flavor: 'バニラ',
    source: 'rakuten',
    stock: {
      status: '残りわずか',
      quantity: 2,
      lowStock: true
    },
    shipping: {
      freeShipping: false,
      deliveryDays: '2-3日',
      shippingCost: 880
    },
    sale: {
      onSale: true,
      discountRate: 7,
      saleEndTime: '2025-12-10T23:59:59'
    }
  }
]

// フィルタリング・ソート関数
export function filterAndSortProteins(filters: {
  goal: string
  exercise: string
  about: string
  timing: string
  flavor: string
}) {
  let filteredProteins = [...dummyProteins]
  
  // 従来形式の商品データを新形式に変換
  const convertedProteins = filteredProteins.map(protein => {
    // 新形式（platforms配列）があればそのまま使用
    if (protein.platforms) {
      return protein
    }
    
    // 従来形式の場合、楽天のみの新形式に変換
    return {
      ...protein,
      platforms: [{
        platform: 'rakuten' as const,
        price: (protein as any).price || 0,
        pricePerServing: (protein as any).pricePerServing || 0,
        originalPrice: (protein as any).originalPrice,
        shopName: (protein as any).shopName || '',
        affiliateUrl: (protein as any).affiliateUrl || '',
        stock: (protein as any).stock,
        shipping: (protein as any).shipping,
        sale: (protein as any).sale
      }],
      bestPrice: {
        platform: 'rakuten' as const,
        price: (protein as any).price || 0,
        pricePerServing: (protein as any).pricePerServing || 0,
        originalPrice: (protein as any).originalPrice,
        shopName: (protein as any).shopName || '',
        affiliateUrl: (protein as any).affiliateUrl || '',
        stock: (protein as any).stock,
        shipping: (protein as any).shipping,
        sale: (protein as any).sale
      }
    }
  })
  
  // スコアリング（すべての商品を対象）
  const scoredProteins = convertedProteins.map(protein => ({
    ...protein,
    score: calculateMatchScore(protein, filters)
  }))
  
  // スコア順にソート
  const sortedProteins = scoredProteins.sort((a, b) => b.score - a.score)
  
  // プロテイン種類での完全一致を優先表示
  const proteinType = determineProteinType(filters)
  const perfectMatches = sortedProteins.filter(p => p.type === proteinType)
  const otherMatches = sortedProteins.filter(p => p.type !== proteinType)
  
  // 完全一致を上位に、その他を下位に配置
  const finalResult = [
    ...perfectMatches.slice(0, 6), // 上位6つの完全一致
    ...otherMatches.slice(0, 4)    // その他から4つ
  ]
  
  return finalResult.filter(p => p.score > 30) // 最低スコア30以上のみ表示
}

// 診断結果からプロテイン種類を決定
function determineProteinType(filters: any): string {
  if (filters.about === 'plant') return 'ソイ'
  if (filters.goal === 'beauty' && filters.about === 'female') return 'ソイ'
  if (filters.timing === 'night') return 'カゼイン'
  if (filters.exercise === 'heavy') return 'ホエイ'
  return 'ホエイ' // デフォルト
}

// 診断結果から予算を決定
function determineBudget(filters: any): number {
  if (filters.about === 'budget') return 100
  if (filters.goal === 'beauty') return 180
  if (filters.exercise === 'heavy') return 150
  return 130 // 標準
}

// マッチスコア計算
function calculateMatchScore(protein: any, filters: any): number {
  let score = 0
  
  // レビュー評価 (40点)
  score += protein.reviewAverage * 8
  
  // レビュー数 (20点)
  score += Math.min(protein.reviewCount / 100, 20)
  
  // 価格適正性 (25点) - 最安値を使用
  const budget = determineBudget(filters)
  const bestPricePerServing = protein.bestPrice?.pricePerServing || protein.pricePerServing || 999
  if (bestPricePerServing <= budget * 0.8) score += 25
  else if (bestPricePerServing <= budget) score += 20
  else if (bestPricePerServing <= budget * 1.2) score += 10
  
  // タンパク質含有量 (15点)
  if (protein.nutrition.protein >= 22) score += 15
  else if (protein.nutrition.protein >= 20) score += 12
  else if (protein.nutrition.protein >= 18) score += 8
  else score += 5
  
  return score
}