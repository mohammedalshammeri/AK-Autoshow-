'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function ChatwayWidget() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const pathname = usePathname();

  // إخفاء الـ widget في صفحات الـ admin
  const isAdminPage = pathname?.includes('/admin');

  useEffect(() => {
    if (!isAdminPage) {
      console.log('🗨️ تحميل Chatway Live Chat Widget للصفحة:', pathname);
    }
  }, [pathname, isAdminPage]);

  // لا تعرض الـ widget في صفحات الـ admin
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {/* Chatway Live Chat Widget Script */}
      <Script
        id="chatway-widget"
        src="https://cdn.chatway.app/widget.js?id=yyICFURJy4Y8"
        strategy="afterInteractive"
        async        onLoad={() => {
          console.log('✅ تم تحميل Chatway Widget بنجاح');
          setIsLoaded(true);
          setHasError(false);
        }}
        onError={(e) => {
          console.error('❌ فشل في تحميل Chatway Widget:', e);
          setIsLoaded(false);
          setHasError(true);
        }}
      />      {/* Debug info disabled for clean UI */}
      {false && process.env.NODE_ENV === 'development' && (
        <div 
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 10000,
            display: isLoaded || hasError ? 'block' : 'none'
          }}
        >
          🗨️ Chat: {isLoaded ? '✅ جاهز' : hasError ? '❌ خطأ' : '⏳ تحميل'}
        </div>
      )}

      {/* Custom styling for the chat widget */}
      <style jsx global>{`
        /* تخصيص مظهر widget الـ chat */
        .chatway-widget,
        [id*="chatway"] {
          z-index: 9999 !important;
        }
        
        /* تحسين الموضع في الشاشات الصغيرة */
        @media (max-width: 768px) {
          .chatway-widget,
          [id*="chatway"] {
            bottom: 20px !important;
            right: 20px !important;
          }
        }

        /* تحسين الشكل العام */
        .chatway-widget {
          border-radius: 15px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        }

        /* إخفاء widget أثناء التحميل لتجنب الوميض */
        .chatway-widget[data-loading="true"] {
          opacity: 0 !important;
          transition: opacity 0.3s ease !important;
        }

        .chatway-widget[data-loading="false"] {
          opacity: 1 !important;
          transition: opacity 0.3s ease !important;
        }
      `}</style>
    </>
  );
}
