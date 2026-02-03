-- إنشاء مجلد التخزين لشعارات الرعاة
-- Create storage bucket for sponsors logos

-- إنشاء bucket جديد للشعارات
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsors-logos', 'sponsors-logos', true)
ON CONFLICT (id) DO NOTHING;

-- سياسة للقراءة العامة (عرض الشعارات للجميع)
CREATE POLICY "Public Access for Sponsors Logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsors-logos');

-- سياسة للكتابة للمستخدمين المصادق عليهم (رفع الشعارات للإدارة فقط)
CREATE POLICY "Authenticated users can upload sponsors logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sponsors-logos' 
  AND auth.role() = 'authenticated'
);

-- سياسة للتحديث للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can update sponsors logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'sponsors-logos' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'sponsors-logos' 
  AND auth.role() = 'authenticated'
);

-- سياسة للحذف للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can delete sponsors logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sponsors-logos' 
  AND auth.role() = 'authenticated'
);

-- التحقق من إنشاء البكت بنجاح
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE id = 'sponsors-logos';
