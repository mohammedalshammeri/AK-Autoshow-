'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export function SponsorsSection() {
  const t = useTranslations('sponsors');
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      console.log('🏢 جلب الرعاة...');
      setLoading(true);
      
      const response = await fetch('/api/sponsors', {
        method: 'GET',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // فلترة الرعاة النشطين فقط وترتيبهم
        const activeSponsors = (result.sponsors || [])
          .filter((sponsor: Sponsor) => sponsor.is_active)
          .sort((a: Sponsor, b: Sponsor) => a.display_order - b.display_order);
        
        setSponsors(activeSponsors);
        console.log(`✅ تم جلب ${activeSponsors.length} راعي نشط`);
      } else {
        console.error('❌ فشل جلب الرعاة:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب الرعاة:', error);
      setError(error instanceof Error ? error.message : 'خطأ غير معروف');    } finally {
      setLoading(false);
    }
  };

  // التحكم بالأسهم
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % sponsors.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + sponsors.length) % sponsors.length);
  };

  // التحكم بالسحب (Drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 50) {
      if (walk > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // التحكم باللمس (Touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX) return;
    const x = e.touches[0].clientX;
    const walk = x - startX;
    if (Math.abs(walk) > 50) {
      if (walk > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
      setStartX(0);
    }
  };

  // التحريك التلقائي
  useEffect(() => {
    if (isPaused || sponsors.length === 0) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, sponsors.length, currentIndex]);


  if (loading) {
    return (
      <section className="py-12 bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-48 mx-auto mb-8"></div>
              <div className="flex justify-center space-x-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 w-32 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || sponsors.length === 0) {
    return null; // لا نعرض شيء إذا كان هناك خطأ أو لا يوجد رعاة
  }  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            🤝 Our Partners & Event Sponsors
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
            We are proud to partner with the best companies in automotive and financing
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mt-6 rounded-full"></div>
        </div>        {/* عرض الرعاة بشكل بسيط وأنيق */}
        <div className="relative">
          {sponsors.length > 4 && (
            <>
              {/* أسهم التحكم البسيطة */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-300 backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-300 backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}          {/* عرض الرعاة بتصميم نظيف */}
          <div className="px-8">            {sponsors.length <= 4 ? (
              // عرض ثابت للرعاة الأربعة أو أقل - بدون إطار وبدون نص
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-6xl mx-auto">
                {sponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="group transition-all duration-300 hover:scale-110"
                  >
                    <img 
                      src={sponsor.logo_url} 
                      alt={sponsor.name}
                      className="w-full h-20 md:h-24 object-contain transition-all duration-300 filter hover:brightness-110 hover:drop-shadow-2xl"
                      onError={(e) => {
                        console.warn(`استخدام صورة بديلة للراعي: ${sponsor.name}`);
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sponsor.name)}&size=400&background=f97316&color=ffffff&font-size=0.3&format=png&rounded=true`;
                      }}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>            ) : (
              // عرض متحرك للرعاة الأكثر من 4 - بدون إطار وبدون نص
              <div 
                className="overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div 
                  className="flex transition-transform duration-500 ease-in-out gap-12"
                  style={{ 
                    transform: `translateX(-${(currentIndex * 240)}px)`,
                  }}
                >
                  {sponsors.map((sponsor, index) => (
                    <div
                      key={sponsor.id}
                      className="flex-shrink-0 group transition-all duration-300 hover:scale-110"
                      style={{ width: '200px' }}
                    >
                      <img 
                        src={sponsor.logo_url} 
                        alt={sponsor.name}
                        className="w-full h-20 md:h-24 object-contain transition-all duration-300 filter hover:brightness-110 hover:drop-shadow-2xl"
                        onError={(e) => {
                          console.warn(`استخدام صورة بديلة للراعي: ${sponsor.name}`);
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sponsor.name)}&size=400&background=f97316&color=ffffff&font-size=0.3&format=png&rounded=true`;
                        }}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>          {/* نقاط التحكم للعرض المتحرك */}
          {sponsors.length > 4 && (
            <div className="flex justify-center mt-8 gap-3">
              {Array.from({ length: Math.max(1, sponsors.length - 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex 
                      ? 'w-8 h-3 bg-gradient-to-r from-orange-500 to-red-500' 
                      : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
