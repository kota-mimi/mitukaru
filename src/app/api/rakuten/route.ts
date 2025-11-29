import { NextRequest, NextResponse } from 'next/server'

// 楽天商品検索API統合
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword') || 'プロテイン'
  const page = parseInt(searchParams.get('page') || '1')
  
  // 楽天APIキー（環境変数またはヘッダーから取得）
  const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID || request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!RAKUTEN_APP_ID) {
    return NextResponse.json({ 
      error: '楽天APIキーが設定されていません',
      message: 'RAKUTEN_APP_IDを環境変数に設定するか、Authorizationヘッダーで送信してください'
    }, { status: 500 })
  }

  try {
    // 楽天商品検索API呼び出し（動作確認済みの形式）
    const apiUrl = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?` +
      `applicationId=${RAKUTEN_APP_ID}&` +
      `keyword=${encodeURIComponent(keyword)}&` +
      `page=${page}&` +
      `hits=30&` +
      `formatVersion=2`

    console.log('楽天API URL:', apiUrl.replace(RAKUTEN_APP_ID, 'APP_ID_HIDDEN'))
    console.log('楽天API 呼び出し開始...')

    const response = await fetch(apiUrl)
    
    console.log('楽天API レスポンス:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('楽天API エラーレスポンス:', errorText)
      throw new Error(`楽天API エラー: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    
    // プロテイン商品データを整形
    const proteins = data.Items?.map((item: any) => {
      const product = item.Item
      
      return {
        id: product.itemCode,
        name: product.itemName,
        brand: extractBrand(product.itemName),
        price: product.itemPrice,
        pricePerServing: Math.round(product.itemPrice / estimateServings(product.itemName)),
        imageUrl: getHighQualityImageUrl(product.mediumImageUrls?.[0] || product.smallImageUrls?.[0] || ''),
        shopName: product.shopName,
        reviewCount: product.reviewCount,
        reviewAverage: product.reviewAverage,
        description: product.itemCaption?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        url: product.itemUrl,
        affiliateUrl: product.affiliateUrl,
        tags: extractTags(product.itemName),
        type: extractProteinType(product.itemName),
        features: {
          protein: extractProteinContent(product.itemName),
          calories: extractCalories(product.itemName),
          servings: estimateServings(product.itemName)
        },
        source: 'rakuten',
        lastUpdated: new Date().toISOString()
      }
    }) || []

    // プロテイン関連商品のみフィルタリング
    const filteredProteins = proteins.filter((protein: any) => 
      isProteinProduct(protein.name)
    )

    return NextResponse.json({
      success: true,
      products: filteredProteins,
      totalCount: data.count,
      page: data.page,
      pageCount: Math.ceil(data.count / 30),
      source: 'rakuten'
    })

  } catch (error: any) {
    console.error('楽天API エラー:', error)
    return NextResponse.json({ 
      error: '商品取得中にエラーが発生しました',
      details: error.message 
    }, { status: 500 })
  }
}

// 高品質画像URL取得（楽天の画像サイズを500x500に変更）
function getHighQualityImageUrl(originalUrl: string): string {
  if (!originalUrl) return '';
  
  // 楽天の画像URLの場合、サイズパラメータを変更
  if (originalUrl.includes('thumbnail.image.rakuten.co.jp')) {
    // ?_ex=128x128 を ?_ex=500x500 に変更
    return originalUrl.replace(/\?_ex=\d+x\d+/, '?_ex=500x500');
  }
  
  return originalUrl;
}

// ブランド名抽出
function extractBrand(itemName: string): string {
  const brands = [
    'SAVAS', 'ザバス', 'DNS', 'beLEGEND', 'ビーレジェンド',
    'Myprotein', 'マイプロテイン', 'ALPRON', 'アルプロン',
    'GOLD\'S GYM', 'ゴールドジム', 'X-PLOSION', 'エクスプロージョン',
    'WELINA', 'ウェリナ', 'VALX', 'バルクス'
  ]
  
  for (const brand of brands) {
    if (itemName.includes(brand)) {
      return brand
    }
  }
  
  // ブランド名が見つからない場合は最初の単語を返す
  return itemName.split(/[\s　]+/)[0] || 'その他'
}

// プロテイン種類抽出
function extractProteinType(itemName: string): string[] {
  const types = []
  
  if (itemName.match(/ホエイ|whey/i)) types.push('ホエイ')
  if (itemName.match(/ソイ|soy|大豆/i)) types.push('ソイ')
  if (itemName.match(/カゼイン|casein/i)) types.push('カゼイン')
  if (itemName.match(/植物性|ピープロテイン/i)) types.push('植物性')
  
  return types.length > 0 ? types : ['その他']
}

// タンパク質含有量抽出
function extractProteinContent(itemName: string): number {
  const match = itemName.match(/(\d+)g.*タンパク質|タンパク質.*(\d+)g|protein.*(\d+)g/i)
  if (match) {
    return parseInt(match[1] || match[2] || match[3])
  }
  
  // デフォルト値（ホエイプロテインの平均）
  if (itemName.includes('ホエイ') || itemName.includes('whey')) return 21
  if (itemName.includes('ソイ') || itemName.includes('soy')) return 16
  
  return 20 // 平均値
}

// カロリー抽出
function extractCalories(itemName: string): number {
  const match = itemName.match(/(\d+)kcal|(\d+)カロリー/i)
  if (match) {
    return parseInt(match[1] || match[2])
  }
  
  return 110 // 平均値
}

// 服用回数推定
function estimateServings(itemName: string): number {
  const weightMatch = itemName.match(/(\d+(?:\.\d+)?)kg|(\d+)g/i)
  if (weightMatch) {
    const weight = parseFloat(weightMatch[1] || weightMatch[2])
    if (weight > 10) { // kgの場合
      return Math.round((weight * 1000) / 30) // 1回30g想定
    } else if (weight > 100) { // gの場合
      return Math.round(weight / 30)
    }
  }
  
  return 30 // デフォルト30回分
}

// プロテイン商品判定（厳格版 - プロテイン粉末のみ）
function isProteinProduct(itemName: string): boolean {
  // 必須キーワード - これらのうち少なくとも1つが含まれている必要
  const essentialKeywords = [
    'プロテイン', 'protein', 'ホエイ', 'whey', 'ソイ', 'soy', 
    'カゼイン', 'casein'
  ]
  
  // 除外キーワード - これらが含まれていたら除外
  const excludeKeywords = [
    'シェイカー', 'ボトル', '容器', 'ドリンク', '飲料',
    'サプリメント', 'ビタミン', 'ミネラル',
    'クレアチン', 'BCAA', 'HMB', 'EAA', 'グルタミン',
    'マルチビタミン', 'フィッシュオイル', 'オメガ',
    'バー', '棒', 'クッキー', 'ウエハース', 'グミ',
    'タブレット', '錠剤', 'カプセル',
    'スプーン', 'ファンネル', '漏斗', 'メジャー',
    'ケース', 'ケース付き', 'セット',
    'アパレル', 'ウェア', 'タオル', '服',
    'ダンベル', 'バーベル', '器具',
    '本', 'DVD', 'ブック', 'マニュアル'
  ]
  
  const itemLower = itemName.toLowerCase()
  
  // 必須キーワードチェック
  const hasEssential = essentialKeywords.some(keyword => 
    itemLower.includes(keyword.toLowerCase())
  )
  
  // 除外キーワードチェック
  const hasExcluded = excludeKeywords.some(keyword => 
    itemName.includes(keyword)
  )
  
  // 重量の記載があることを確認（プロテイン粉末には通常重量表記がある）
  const hasWeight = /\d+(?:\.\d+)?(?:kg|g|キロ|グラム)/i.test(itemName)
  
  return hasEssential && !hasExcluded && hasWeight
}

// タグ抽出
function extractTags(itemName: string): string[] {
  const tags = []
  
  if (itemName.match(/ダイエット|減量|脂肪燃焼/i)) tags.push('ダイエット')
  if (itemName.match(/筋肉|筋トレ|ボディビル/i)) tags.push('筋トレ')
  if (itemName.match(/美容|コラーゲン|ヒアルロン酸/i)) tags.push('美容')
  if (itemName.match(/国産|日本製/i)) tags.push('国産')
  if (itemName.match(/無添加|人工甘味料不使用/i)) tags.push('無添加')
  if (itemName.match(/初心者|ビギナー/i)) tags.push('初心者向け')
  if (itemName.match(/プロ|アスリート|本格/i)) tags.push('本格')
  
  return tags
}