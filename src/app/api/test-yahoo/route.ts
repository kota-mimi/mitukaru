import { NextRequest, NextResponse } from 'next/server'
import { searchYahooProducts } from '@/lib/yahooApi'

export async function GET(request: NextRequest) {
  console.log('🧪 Yahoo!ショッピングAPI テスト開始')
  
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || 'プロテイン ホエイ チョコレート'
    
    console.log('🔍 検索クエリ:', query)
    console.log('📋 環境変数確認:')
    console.log('- YAHOO_APP_ID:', process.env.YAHOO_APP_ID ? '設定済み' : '未設定')
    console.log('- YAHOO_AFFILIATE_ID:', process.env.YAHOO_AFFILIATE_ID ? '設定済み' : '未設定')
    
    // Yahoo!ショッピングAPI呼び出し
    const products = await searchYahooProducts(query)
    
    return NextResponse.json({
      success: true,
      message: 'Yahoo!ショッピングAPIテスト結果',
      query,
      environment: {
        yahooAppId: process.env.YAHOO_APP_ID ? 'configured' : 'missing',
        yahooAffiliateId: process.env.YAHOO_AFFILIATE_ID ? 'configured' : 'missing'
      },
      products,
      productCount: products.length,
      sampleProduct: products[0] || null,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Yahoo!ショッピングAPIテストエラー:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error,
      environment: {
        yahooAppId: process.env.YAHOO_APP_ID ? 'configured' : 'missing',
        yahooAffiliateId: process.env.YAHOO_AFFILIATE_ID ? 'configured' : 'missing'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}