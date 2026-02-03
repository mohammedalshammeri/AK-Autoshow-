'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export function GallerySection() {
  const t = useTranslations('gallery');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    try {
      console.log('🖼️ جلب صور المعرض للعرض العام...');
      
      const response = await fetch('/api/admin/gallery', {
        method: 'GET'
      });

      const result = await response.json();

      if (result.success) {
        // فلترة الصور النشطة فقط وترتيبها
        const activeImages = (result.images || [])
          .filter((img: GalleryImage) => img.image_url) // التأكد من وجود رابط الصورة
          .sort((a: GalleryImage, b: GalleryImage) => a.display_order - b.display_order);
        
        setImages(activeImages);
        console.log(`✅ تم جلب ${activeImages.length} صورة نشطة للمعرض`);
      } else {
        console.error('❌ فشل جلب صور المعرض:', result.error);
        setError('فشل في تحميل صور المعرض');
      }
    } catch (error) {
      console.error('❌ خطأ في جلب صور المعرض:', error);
      setError('حدث خطأ في تحميل صور المعرض');
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (images.length === 0) return;
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  };

  // التحكم بالكيبورد
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') nextImage();
      else if (e.key === 'ArrowLeft') prevImage();
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, currentIndex]);

  if (loading) {
    return (
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              معرض الصور
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6"></div>
          </div>
          
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-400">جاري تحميل صور المعرض...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || images.length === 0) {
    return (
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              معرض الصور
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6"></div>
          </div>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-gray-400 text-xl mb-2">
              {error || 'لا توجد صور في المعرض حالياً'}
            </p>
            <p className="text-gray-500">
              سيتم إضافة صور جديدة قريباً
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 bg-gray-900" id="gallery">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              معرض الصور
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              استكشف مجموعة مختارة من أفضل اللحظات والسيارات المشاركة في معارضنا السابقة
            </p>
          </div>

          {/* معرض الصور */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl bg-gray-800 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                onClick={() => openLightbox(image, index)}
              >
                {/* الصورة */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  
                  {/* صورة بديلة في حالة الخطأ */}
                  <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p>فشل تحميل الصورة</p>
                    </div>
                  </div>

                  {/* overlay للتفاعل */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">
                        {image.title}
                      </h3>
                      {image.description && (
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {image.description}
                        </p>
                      )}
                    </div>
                    
                    {/* أيقونة التكبير */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* إحصائيات المعرض */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-6 bg-gray-800 rounded-full px-8 py-4 border border-yellow-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{images.length}</div>
                <div className="text-gray-400 text-sm">صورة</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">HD</div>
                <div className="text-gray-400 text-sm">جودة عالية</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl w-full max-h-full">
            {/* أزرار التنقل */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* زر الإغلاق */}
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* محتوى الصورة */}
            <div 
              className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="w-full max-h-[80vh] object-contain"
              />
              
              {/* معلومات الصورة */}
              <div className="p-6 bg-gray-900">
                <h3 className="text-white text-xl font-bold mb-2">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-gray-300 mb-4">
                    {selectedImage.description}
                  </p>
                )}
                
                {/* مؤشر الصورة الحالية */}
                <div className="flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    {currentIndex + 1} من {images.length}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(selectedImage.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
