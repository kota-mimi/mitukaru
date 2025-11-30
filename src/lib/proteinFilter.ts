// 統一されたプロテイン商品フィルタリングロジック

export interface ProteinProduct {
  id: string;
  name: string;
  brand?: string;
  type?: string[];
  description?: string;
  price?: number;
}

// 統一プロテイン商品判定関数
export function isValidProteinProduct(itemName: string, description?: string): boolean {
  const name = itemName.toLowerCase();
  const desc = (description || '').toLowerCase();
  const fullText = `${name} ${desc}`;
  
  // プロテイン必須キーワード - プロテインサイトなので絶対にプロテイン関連のみ
  const proteinKeywords = [
    'プロテイン', 'protein', 'ホエイ', 'whey', 'ソイ', 'soy', 
    'カゼイン', 'casein', '大豆プロテイン'
  ];
  
  // 除外キーワード - これらが含まれていたら除外
  const excludeKeywords = [
    // 関連商品（プロテイン以外）
    'シェイカー', 'ボトル', '容器', 'ドリンク', '飲料水', '飲み物',
    'クレアチン', 'hmb', 'グルタミン', 'bcaa', 'eaa', 'アミノ酸',
    'マルチビタミン', 'フィッシュオイル', 'オメガ',
    
    // 加工食品
    'バー', '棒', 'クッキー', 'ウエハース', 'グミ', 'ゼリー',
    'タブレット', '錠剤', 'カプセル', 'サプリメント',
    
    // アクセサリ
    'スプーン', 'ファンネル', '漏斗', 'メジャー', '計量',
    'ケース', 'ケース付き', 'セット', 'ミキサー',
    
    // 衣類・器具
    'アパレル', 'ウェア', 'タオル', '服', 'tシャツ',
    'ダンベル', 'バーベル', '器具', 'マシン',
    
    // 生花・装飾品
    'フラワー', 'flower', '花', 'アート', 'art', '造花', '装飾',
    'インテリア', 'デコレーション', 'リース', 'ブーケ',
    
    // その他
    '本', 'dvd', 'ブック', 'マニュアル', '書籍',
    '青汁', '酵素', 'コラーゲン'
  ];
  
  // プロテイン必須キーワードチェック
  const hasProtein = proteinKeywords.some(keyword => 
    fullText.includes(keyword.toLowerCase())
  );
  
  // 除外キーワードチェック
  const hasExcluded = excludeKeywords.some(keyword => 
    fullText.includes(keyword.toLowerCase())
  );
  
  // 重量の記載があることを確認（プロテイン粉末には通常重量表記がある）
  const hasWeight = /\d+(?:\.\d+)?(?:kg|g|キロ|グラム)/i.test(itemName);
  
  // 絶対にプロテインのみ: プロテインキーワード必須 + 除外なし + 重量あり
  return hasProtein && !hasExcluded && hasWeight;
}

// プロテイン種類抽出（統一版）
export function extractProteinTypes(itemName: string): string[] {
  const name = itemName.toLowerCase();
  const types: string[] = [];
  
  if (name.includes('ホエイ') || name.includes('whey')) types.push('ホエイ');
  if (name.includes('ソイ') || name.includes('soy') || name.includes('大豆')) types.push('ソイ');
  if (name.includes('カゼイン') || name.includes('casein')) types.push('カゼイン');
  if (name.includes('植物性') || name.includes('ピープロテイン')) types.push('植物性');
  
  return types.length > 0 ? types : ['その他'];
}

// プロテイン種類からカテゴリIDへのマッピング（統一版）
export function extractCategory(itemName: string): string {
  const name = itemName.toLowerCase();
  
  if (name.includes('ホエイ') || name.includes('whey')) return 'WHEY';
  if (name.includes('ソイ') || name.includes('soy') || name.includes('大豆') || name.includes('植物性')) return 'VEGAN';
  if (name.includes('カゼイン') || name.includes('casein')) return 'CASEIN';
  
  return 'WHEY'; // デフォルトはホエイとする
}

// ブランド抽出（統一版）
export function extractBrand(itemName: string): string {
  const name = itemName.toLowerCase();
  
  const brands = [
    { keywords: ['ザバス', 'savas'], name: 'ザバス' },
    { keywords: ['dns'], name: 'DNS' },
    { keywords: ['ビーレジェンド', 'belegend'], name: 'beLEGEND' },
    { keywords: ['マイプロテイン', 'myprotein'], name: 'マイプロテイン' },
    { keywords: ['アルプロン', 'alpron'], name: 'アルプロン' },
    { keywords: ['ゴールドジム', 'gold\'s gym'], name: 'ゴールドジム' },
    { keywords: ['エクスプロージョン', 'x-plosion'], name: 'エクスプロージョン' },
    { keywords: ['ウェリナ', 'welina'], name: 'ウェリナ' },
    { keywords: ['valx', 'バルクス'], name: 'VALX' },
    { keywords: ['ハレオ', 'haleo'], name: 'ハレオ' },
    { keywords: ['ケンタイ', 'kentai'], name: 'Kentai' }
  ];
  
  for (const brand of brands) {
    if (brand.keywords.some(keyword => name.includes(keyword.toLowerCase()))) {
      return brand.name;
    }
  }
  
  // ブランド名が見つからない場合は最初の単語を返す
  const firstWord = itemName.split(/[\s　(【]+/)[0];
  return firstWord || 'その他';
}

// 栄養成分抽出（統一版）
export function extractNutrition(itemName: string, description?: string) {
  const text = `${itemName} ${description || ''}`;
  
  // タンパク質含有量を抽出
  let protein = 20; // デフォルト値
  const proteinMatch = text.match(/(?:たんぱく質|タンパク質|protein)[\s：:]*(\d+(?:\.\d+)?)g/i);
  if (proteinMatch) {
    protein = parseFloat(proteinMatch[1]);
  }
  
  // カロリーを抽出
  let calories = 110; // デフォルト値
  const calorieMatch = text.match(/(?:エネルギー|カロリー)[\s：:]*(\d+(?:\.\d+)?)kcal/i);
  if (calorieMatch) {
    calories = parseFloat(calorieMatch[1]);
  }
  
  // 容量を抽出してservings計算
  let servings = 30; // デフォルト値
  const weightMatch = itemName.match(/(\d+(?:\.\d+)?)kg|(\d+)g/i);
  if (weightMatch) {
    const weight = parseFloat(weightMatch[1] || weightMatch[2]);
    if (weight > 10) { // kgの場合
      servings = Math.round((weight * 1000) / 30); // 1回30g想定
    } else if (weight > 100) { // gの場合
      servings = Math.round(weight / 30);
    }
  }
  
  return {
    protein,
    calories,
    servings
  };
}