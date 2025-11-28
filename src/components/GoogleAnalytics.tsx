'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  trackingId: string
}

export default function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
  if (!trackingId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true
            });
            
            // カスタムイベント関数をグローバルに設定
            window.trackEvent = function(action, category, label, value) {
              gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
              });
            };
            
            // プロテイン診断関連のイベント追跡
            window.trackDiagnosisStart = function(type) {
              gtag('event', 'diagnosis_start', {
                event_category: 'engagement',
                event_label: type,
                value: 1
              });
            };
            
            window.trackDiagnosisComplete = function(type, result) {
              gtag('event', 'diagnosis_complete', {
                event_category: 'conversion',
                event_label: type,
                value: 1,
                custom_parameters: {
                  diagnosis_result: result
                }
              });
            };
            
            window.trackProductClick = function(productName, platform, price) {
              gtag('event', 'product_click', {
                event_category: 'ecommerce',
                event_label: productName,
                value: price,
                custom_parameters: {
                  platform: platform,
                  product_name: productName
                }
              });
            };
          `
        }}
      />
    </>
  )
}