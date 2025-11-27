import { NextRequest, NextResponse } from 'next/server'

// 楽天市場の全プロテイン商品を一括取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const appId = searchParams.get('appId') || '1054552037945576340'
  const maxPages = parseInt(searchParams.get('maxPages') || '10') // 最大10ページ（300件）
  
  console.log(`楽天 全商品取得開始: 最大${maxPages}ページ`)
  
  const allProducts: any[] = []
  let currentPage = 1
  let totalPages = 1

  try {
    // ページごとに順次取得
    while (currentPage <= maxPages && currentPage <= totalPages) {
      const apiUrl = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?` +
        `applicationId=${appId}&` +
        `keyword=プロテイン&` +
        `page=${currentPage}&` +
        `hits=30&` +
        `formatVersion=2`

      console.log(`ページ ${currentPage} 取得中...`)
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`楽天API エラー (ページ${currentPage}): ${response.status}`)
      }

      const data = await response.json()
      
      // 最初のページで総ページ数を計算
      if (currentPage === 1) {
        totalPages = Math.ceil((data.count || 0) / 30)
        console.log(`総商品数: ${data.count}件、総ページ数: ${totalPages}ページ`)
      }

      // 商品データを変換して配列に追加
      if (data.Items) {
        const pageProducts = data.Items.map((item: any) => {
          const product = item.Item || item
          const description = product.itemCaption || ''
          const itemName = product.itemName || ''
          
          // 正確な栄養成分を抽出
          const nutrition = extractNutritionFromDescription(description, itemName)
          
          return {
            id: product.itemCode || Math.random().toString(36),
            name: itemName,
            brand: extractBrand(itemName),
            price: parseInt(product.itemPrice) || 0,
            pricePerServing: Math.round((parseInt(product.itemPrice) || 0) / (nutrition.servingSize || 30)),
            imageUrl: product.mediumImageUrls?.[0]?.imageUrl || product.smallImageUrls?.[0]?.imageUrl || '',
            shopName: product.shopName || 'ショップ不明',
            reviewCount: product.reviewCount || 0,
            reviewAverage: parseFloat(product.reviewAverage) || 0,
            description: (description || itemName || '').replace(/<[^>]*>/g, '').substring(0, 200) + '...',
            url: product.itemUrl || '',
            affiliateUrl: product.affiliateUrl || product.itemUrl || '',
            tags: extractTags(itemName),
            type: extractProteinType(itemName),
            flavor: extractFlavorFromName(itemName),
            features: {
              protein: nutrition.protein,
              calories: nutrition.calories,
              servings: estimateServings(itemName)
            },
            source: 'rakuten',
            lastUpdated: new Date().toISOString()
          }
        })

        allProducts.push(...pageProducts)
        console.log(`ページ ${currentPage} 完了: ${pageProducts.length}件 (累計: ${allProducts.length}件)`)
      }

      currentPage++
      
      // API制限対策：1秒待機
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // プロテイン関連商品のみフィルタリング
    const proteinProducts = allProducts.filter(product => isProteinProduct(product.name))

    console.log(`取得完了: 全${allProducts.length}件中、プロテイン商品${proteinProducts.length}件`)

    return NextResponse.json({
      success: true,
      message: `楽天市場から${proteinProducts.length}件のプロテイン商品を取得しました`,
      products: proteinProducts,
      totalCount: proteinProducts.length,
      pagesProcessed: currentPage - 1,
      totalPages: totalPages,
      source: 'rakuten-bulk'
    })

  } catch (error: any) {
    console.error('楽天一括取得エラー:', error)
    return NextResponse.json({
      success: false,
      error: '一括取得中にエラーが発生しました',
      details: error.message,
      products: allProducts,
      totalCount: allProducts.length,
      lastPage: currentPage - 1
    }, { status: 500 })
  }
}

// ヘルパー関数群
function extractBrand(itemName: string): string {
  const brands = [
    'SAVAS', 'ザバス', 'DNS', 'beLEGEND', 'ビーレジェンド',
    'Myprotein', 'マイプロテイン', 'ALPRON', 'アルプロン',
    'GOLD\'S GYM', 'ゴールドジム', 'X-PLOSION', 'エクスプロージョン',
    'WELINA', 'ウェリナ', 'VALX', 'バルクス', 'HALEO', 'ハレオ',
    'Kentai', 'ケンタイ', 'VITAS', 'バイタス'
  ]
  
  const nameUpper = itemName.toUpperCase()
  for (const brand of brands) {
    if (nameUpper.includes(brand.toUpperCase())) {
      return brand === 'SAVAS' ? 'ザバス' : 
             brand === 'VALX' ? 'VALX' :
             brand === 'X-PLOSION' ? 'エクスプロージョン' : 
             brand
    }
  }
  
  // 商品名の最初の単語を取得（ブランド名の可能性が高い）
  const firstWord = itemName.split(/[\s　(【]+/)[0]
  return firstWord || 'その他'
}

function extractProteinType(itemName: string): string[] {
  const types = []
  const nameUpper = itemName.toUpperCase()
  
  if (nameUpper.includes('ホエイ') || nameUpper.includes('WHEY')) types.push('ホエイ')
  if (nameUpper.includes('ソイ') || nameUpper.includes('SOY') || nameUpper.includes('大豆')) types.push('ソイ')
  if (nameUpper.includes('カゼイン') || nameUpper.includes('CASEIN')) types.push('カゼイン')
  if (nameUpper.includes('植物性') || nameUpper.includes('ピープロテイン')) types.push('植物性')
  if (nameUpper.includes('EAA') || nameUpper.includes('BCAA')) types.push('アミノ酸')
  
  return types.length > 0 ? types : ['その他']
}

function extractNutritionFromDescription(description: string, itemName: string) {
  // HTMLタグを除去
  const cleanDesc = description.replace(/<[^>]*>/g, ' ')
  
  // 栄養成分表示を探す
  const nutritionPatterns = [
    // 1食(28g)当たり エネルギー108kcal たんぱく質19.5g
    /(\d+(?:\.\d+)?)g[）)]*当たり.*?(?:エネルギー|カロリー)[：:\s]*(\d+(?:\.\d+)?)kcal.*?(?:たんぱく質|タンパク質|protein)[：:\s]*(\d+(?:\.\d+)?)g/i,
    // たんぱく質19.5g エネルギー108kcal
    /(?:たんぱく質|タンパク質|protein)[：:\s]*(\d+(?:\.\d+)?)g.*?(?:エネルギー|カロリー)[：:\s]*(\d+(?:\.\d+)?)kcal/i,
    // エネルギー108kcal たんぱく質19.5g
    /(?:エネルギー|カロリー)[：:\s]*(\d+(?:\.\d+)?)kcal.*?(?:たんぱく質|タンパク質|protein)[：:\s]*(\d+(?:\.\d+)?)g/i
  ]
  
  for (const pattern of nutritionPatterns) {
    const match = cleanDesc.match(pattern)
    if (match) {
      if (pattern === nutritionPatterns[0]) {
        // パターン1: serving, calories, protein
        return {
          servingSize: parseFloat(match[1]),
          calories: parseFloat(match[2]),
          protein: parseFloat(match[3])
        }
      } else if (pattern === nutritionPatterns[1]) {
        // パターン2: protein, calories
        return {
          servingSize: 30, // デフォルト
          calories: parseFloat(match[2]),
          protein: parseFloat(match[1])
        }
      } else {
        // パターン3: calories, protein
        return {
          servingSize: 30, // デフォルト
          calories: parseFloat(match[1]),
          protein: parseFloat(match[2])
        }
      }
    }
  }
  
  // 個別でタンパク質とカロリーを探す
  const proteinMatch = cleanDesc.match(/(?:たんぱく質|タンパク質|protein)[：:\s]*(\d+(?:\.\d+)?)g/i)
  const calorieMatch = cleanDesc.match(/(?:エネルギー|カロリー)[：:\s]*(\d+(?:\.\d+)?)kcal/i)
  
  return {
    servingSize: 30,
    calories: calorieMatch ? parseFloat(calorieMatch[1]) : estimateCalories(itemName),
    protein: proteinMatch ? parseFloat(proteinMatch[1]) : estimateProtein(itemName)
  }
}

function estimateCalories(itemName: string): number {
  // 商品名から推定
  if (itemName.includes('低カロリー') || itemName.includes('ダイエット')) return 100
  if (itemName.includes('WPI')) return 110
  return 115
}

function estimateProtein(itemName: string): number {
  // 商品名から推定
  if (itemName.includes('WPI')) return 22
  if (itemName.includes('ソイ') || itemName.includes('植物性')) return 16
  if (itemName.includes('ホエイ') || itemName.includes('WPC')) return 20
  return 18
}

function extractFlavorFromName(itemName: string): string {
  const flavorPatterns = [
    { pattern: /リッチショコラ|ミルクチョコレート|チョコレート|ココア|チョコ/i, flavor: 'チョコレート' },
    { pattern: /カフェオレ|コーヒー|珈琲/i, flavor: 'カフェオレ' },
    { pattern: /バニラ/i, flavor: 'バニラ' },
    { pattern: /ストロベリー|いちご|ベリー/i, flavor: 'ストロベリー' },
    { pattern: /バナナ/i, flavor: 'バナナ' },
    { pattern: /抹茶|きなこ/i, flavor: '抹茶' },
    { pattern: /ヨーグルト/i, flavor: 'ヨーグルト' },
    { pattern: /マンゴー/i, flavor: 'マンゴー' },
    { pattern: /メロン/i, flavor: 'メロン' },
    { pattern: /レモン|ライム/i, flavor: 'レモン' },
    { pattern: /ピーチ|桃/i, flavor: 'ピーチ' },
    { pattern: /プレーン|ナチュラル|無味/i, flavor: 'プレーン' }
  ]
  
  for (const flavorPattern of flavorPatterns) {
    if (flavorPattern.pattern.test(itemName)) {
      return flavorPattern.flavor
    }
  }
  
  return 'プレーン'
}

function extractCalories(itemName: string): number {
  const match = itemName.match(/(\d+)kcal|(\d+)カロリー/i)
  if (match) {
    return parseInt(match[1] || match[2])
  }
  
  return 110
}

function estimateServings(itemName: string): number {
  const weightMatch = itemName.match(/(\d+(?:\.\d+)?)kg|(\d+)g/i)
  if (weightMatch) {
    const weight = parseFloat(weightMatch[1] || weightMatch[2])
    if (weight > 10) {
      return Math.round((weight * 1000) / 30)
    } else if (weight > 100) {
      return Math.round(weight / 30)
    }
  }
  
  return 30
}

function extractTags(itemName: string): string[] {
  const tags = []
  const nameUpper = itemName.toUpperCase()
  
  if (nameUpper.includes('ダイエット') || nameUpper.includes('減量')) tags.push('ダイエット')
  if (nameUpper.includes('筋肉') || nameUpper.includes('筋トレ') || nameUpper.includes('ボディビル')) tags.push('筋トレ')
  if (nameUpper.includes('美容') || nameUpper.includes('コラーゲン')) tags.push('美容')
  if (nameUpper.includes('国産') || nameUpper.includes('日本製')) tags.push('国産')
  if (nameUpper.includes('無添加') || nameUpper.includes('人工甘味料不使用')) tags.push('無添加')
  if (nameUpper.includes('初心者')) tags.push('初心者向け')
  if (nameUpper.includes('プロ') || nameUpper.includes('アスリート')) tags.push('本格')
  if (nameUpper.includes('女性')) tags.push('女性向け')
  
  return tags
}

function isProteinProduct(itemName: string): boolean {
  const proteinKeywords = [
    'プロテイン', 'PROTEIN', 'ホエイ', 'WHEY', 'ソイ', 'SOY', 
    'カゼイン', 'CASEIN', 'タンパク質', 'アミノ酸', 'AMINO',
    'EAA', 'BCAA', 'HMB'
  ]
  
  const excludeKeywords = [
    'シェイカー', 'ボトル', '容器', 'ミキサー', '計量', 'スプーン',
    'サプリメント', 'ビタミン', 'ミネラル', '青汁', '酵素'
  ]
  
  const nameUpper = itemName.toUpperCase()
  
  const hasProtein = proteinKeywords.some(keyword => 
    nameUpper.includes(keyword.toUpperCase())
  )
  
  const hasExcluded = excludeKeywords.some(keyword => 
    nameUpper.includes(keyword.toUpperCase())
  )
  
  return hasProtein && !hasExcluded
}