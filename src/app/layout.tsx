import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'プロテイン診断 | 最適なプロテインを無料で見つける | 楽天価格比較',
  description: '5つの質問に答えるだけで、あなたの目的・体質・好みにぴったりのプロテインを診断。楽天商品から最安値を検索して最適な商品を提案します。完全無料、登録不要。',
  keywords: 'プロテイン,診断,楽天,価格比較,ホエイプロテイン,ソイプロテイン,筋トレ,ダイエット,栄養,サプリメント',
  authors: [{ name: 'プロテイン診断サービス' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'プロテイン診断 | 最適なプロテインを無料で見つける',
    description: '5つの質問に答えるだけで、あなたにぴったりのプロテインを診断。楽天最安値で購入できます。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'プロテイン診断サービス',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プロテイン診断 | 最適なプロテインを無料で見つける',
    description: '5つの質問に答えるだけで、あなたにぴったりのプロテインを診断。楽天最安値で購入できます。',
  },
  alternates: {
    canonical: 'https://your-domain.vercel.app',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-screen flex flex-col bg-white font-sans text-gray-900`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "プロテイン診断サービス",
              "description": "あなたの目的・体質・好みにぴったりのプロテインを診断するサービス",
              "url": "https://your-domain.vercel.app",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "JPY"
              },
              "featureList": [
                "5ステップでプロテイン診断",
                "楽天商品価格比較",
                "栄養成分分析",
                "個人の目的に合わせた提案"
              ]
            })
          }}
        />
        <GoogleAnalytics trackingId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''} />
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}