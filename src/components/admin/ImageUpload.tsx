'use client';

import { useState } from 'react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploadedAction: (imageUrl: string) => void;
  bucket?: string;
  folder?: string;
}

export function ImageUpload({ 
  currentImageUrl, 
  onImageUploadedAction, 
  bucket = 'sponsors-logos',
  folder = 'logos' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [inputId] = useState(`imageUpload-${Date.now()}-${Math.random().toString(36).substring(2)}`);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      const file = event.target.files?.[0];
      if (!file) return;

      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }

      // التحقق من حجم الملف (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }      // إنشاء معاينة محلية
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreview(e.target.result as string);
        }
      };
      reader.onerror = () => {
        console.error('❌ خطأ في قراءة الملف');
        alert('خطأ في قراءة الملف. يرجى المحاولة مرة أخرى.');
      };
      reader.readAsDataURL(file);

      // تنظيف اسم الملف
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('🔄 رفع الصورة:', fileName);

      let publicUrl = '';

      // محاولة الرفع عبر Cloudinary API
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', bucket); // نستخدم اسم الـ bucket كمجلد في Cloudinary

        const response = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          publicUrl = result.url;
          console.log('✅ تم الرفع إلى Cloudinary بنجاح:', publicUrl);
        } else {
          console.warn('⚠️ فشل الرفع إلى Cloudinary.');
        }
      } catch (e) {
        console.error('❌ خطأ في الاتصال بـ Cloudinary API:', e);
      }

      // إذا فشل Cloudinary، نظهر خطأ
      if (!publicUrl) {
         throw new Error('فشل الرفع إلى Cloudinary. يرجى التحقق من الاتصال أو المحاولة لاحقاً.');
      }

      console.log('✅ الصورة جاهزة:', publicUrl);
      onImageUploadedAction(publicUrl);

    } catch (error) {
      console.error('❌ خطأ في رفع الصورة:', error);
      alert(`خطأ في رفع الصورة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageUploadedAction('');
  };
  return (
    <div className="space-y-4">
      {/* معاينة الصورة */}
      {preview && (
        <div className="relative w-40 h-40 mx-auto mb-4">
          <img 
            src={preview} 
            alt="معاينة الشعار"
            className="w-full h-full object-contain rounded-xl border-2 border-orange-500 bg-white p-2"            onError={(e) => {
              console.warn('تعذر تحميل الصورة:', preview);
              
              // إخفاء الصورة المعطلة وإظهار رسالة بديلة
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.image-error-placeholder')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'image-error-placeholder w-full h-full flex flex-col items-center justify-center bg-gray-700 rounded-xl border-2 border-dashed border-gray-500 text-gray-400';
                errorDiv.innerHTML = `
                  <div class="text-4xl mb-2">🚫</div>
                  <div class="text-sm text-center">
                    <div>فشل تحميل الصورة</div>
                    <div class="text-xs mt-1">يرجى المحاولة مرة أخرى</div>
                  </div>
                `;
                parent.appendChild(errorDiv);
              }
            }}
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
          >
            ×
          </button>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs">
            ✅ جاهز للحفظ
          </div>
        </div>
      )}

      {/* منطقة رفع الصورة */}
      <div className="relative">        <input
          type="file"
          id={inputId}
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        
        <label
          htmlFor={inputId}
          className={`
            flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer
            transition-all duration-200
            ${uploading 
              ? 'border-gray-500 bg-gray-800 cursor-not-allowed' 
              : 'border-orange-500 hover:border-orange-400 bg-gradient-to-br from-orange-900/20 to-red-900/20 hover:from-orange-800/30 hover:to-red-800/30'
            }
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mb-3"></div>
              <p className="text-orange-400 text-lg font-medium">جاري رفع الصورة...</p>
              <p className="text-gray-400 text-sm">يرجى الانتظار</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-3">📸</div>
              <p className="text-white text-xl font-bold mb-1">ارفع شعار الراعي</p>
              <p className="text-orange-400 text-sm font-medium mb-2">اضغط هنا لاختيار صورة من جهازك</p>
              <p className="text-gray-400 text-xs">PNG, JPG, JPEG, GIF, WebP (أقل من 5MB)</p>
            </div>
          )}
        </label>
      </div>

      {/* رسالة توضيحية */}
      <div className="text-center bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-3 rounded-lg border border-blue-500/30">
        <p className="text-gray-400 text-sm">
          أو يمكنك استخدام رابط مباشر للصورة
        </p>
      </div>
    </div>
  );
}
