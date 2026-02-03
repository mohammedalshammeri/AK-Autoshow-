import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

// GET - جلب جميع صور المعرض
export async function GET() {
  try {
    console.log('🖼️ جلب صور المعرض...');
    
    const result = await query(
      'SELECT * FROM gallery_images WHERE is_active = true ORDER BY display_order ASC'
    );

    console.log('✅ تم جلب', result.rows.length, 'صورة معرض');
    
    return NextResponse.json({
      success: true,
      images: result.rows || []
    });

  } catch (error) {
    console.error('❌ خطأ عام في جلب صور المعرض:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - إضافة صورة جديدة للمعرض
export async function POST(request: NextRequest) {
  try {
    console.log('📸 بدء رفع صورة معرض جديدة...');
    
    // مؤقتاً: تخطي التحقق من المصادقة للاختبار
    console.log('⚠️ تخطي التحقق من المصادقة مؤقتاً للاختبار');

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const displayOrder = parseInt(formData.get('displayOrder') as string) || 0;
    const imageFile = formData.get('image') as File;

    if (!title || !imageFile) {
      return NextResponse.json(
        { success: false, error: 'العنوان والصورة مطلوبان' },
        { status: 400 }
      );
    }

    console.log('📸 رفع صورة معرض جديدة:', {
      title,
      fileName: imageFile.name,
      size: imageFile.size,
      displayOrder
    });

    // إنشاء اسم ملف فريد (للارشفة)
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `gallery_${timestamp}.${fileExtension}`;

    let imageUrl = '';
    let storedFileName = fileName;

    // الرفع إلى Cloudinary
    try {
        console.log('☁️ جاري الرفع إلى Cloudinary (Gallery)...');
        const cResult = await uploadToCloudinary(imageFile, 'gallery-images');
        imageUrl = cResult.secure_url;
        storedFileName = cResult.public_id; // معرف الصورة في Cloudinary
        console.log('✅ تم الرفع إلى Cloudinary:', imageUrl);
    } catch (e: any) {
        console.error('❌ خطأ في Cloudinary:', e);
        return NextResponse.json(
            { success: false, error: `فشل رفع الصورة: ${e.message}` },
            { status: 500 }
        );
    }

    // حفظ معلومات الصورة في قاعدة البيانات (Neon Postgres)
    const insertSQL = `
      INSERT INTO gallery_images (title, description, image_url, file_name, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const { rows } = await query(insertSQL, [
      title,
      description || null,
      imageUrl,
      storedFileName,
      displayOrder
    ]);

    const insertData = rows[0];

    console.log('✅ تم رفع وحفظ صورة المعرض بنجاح:', insertData);

    return NextResponse.json({
      success: true,
      message: 'تم إضافة صورة المعرض بنجاح',
      image: insertData
    });

  } catch (error) {
    console.error('❌ خطأ عام في إضافة صورة المعرض:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - تحديث صورة المعرض
export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ بدء تحديث صورة المعرض...');
    
    // مؤقتاً: تخطي التحقق من المصادقة للاختبار
    console.log('⚠️ تخطي التحقق من المصادقة مؤقتاً للاختبار');

    const body = await request.json();
    const { id, title, description, displayOrder, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الصورة مطلوب' },
        { status: 400 }
      );
    }

    console.log('✏️ تحديث صورة المعرض:', id);

    // بناء جملة التحديث ديناميكياً
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (displayOrder !== undefined) {
      updates.push(`display_order = $${paramIndex++}`);
      values.push(displayOrder);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length > 1) { // > 1 because updated_at is always added
        values.push(id);
        const updateSQL = `
            UPDATE gallery_images
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        const { rows } = await query(updateSQL, values);
        
        if (rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'فشل تحديث صورة المعرض أو الصورة غير موجودة' },
                { status: 404 }
            );
        }

        console.log('✅ تم تحديث صورة المعرض بنجاح:', rows[0]);

        return NextResponse.json({
            success: true,
            message: 'تم تحديث صورة المعرض بنجاح',
            image: rows[0]
        });
    } else {
        return NextResponse.json({
             success: true,
             message: 'لا توجد بيانات للتحديث'
        });
    }

  } catch (error) {
    console.error('❌ خطأ عام في تحديث صورة المعرض:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - حذف صورة المعرض
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ بدء حذف صورة المعرض...');
    
    // مؤقتاً: تخطي التحقق من المصادقة للاختبار
    console.log('⚠️ تخطي التحقق من المصادقة مؤقتاً للاختبار');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الصورة مطلوب' },
        { status: 400 }
      );
    }

    console.log('🗑️ حذف صورة المعرض:', id);

    // جلب معلومات الصورة أولاً للحصول على اسم الملف
    const selectSQL = 'SELECT file_name, image_url FROM gallery_images WHERE id = $1';
    const { rows: imageRows } = await query(selectSQL, [id]);

    if (imageRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الصورة غير موجودة' },
        { status: 404 }
      );
    }

    const imageData = imageRows[0];

    // حذف الصورة من قاعدة البيانات
    const deleteSQL = 'DELETE FROM gallery_images WHERE id = $1';
    await query(deleteSQL, [id]);

    // حذف الملف من التخزين (Cloudinary)
    if (imageData.file_name) {
        try {
            await deleteFromCloudinary(imageData.file_name);
            console.log('✅ تم حذف الملف من Cloudinary');
        } catch (e) {
            console.warn('⚠️ فشل حذف الملف من Cloudinary:', e);
            // لا نرجع خطأ هنا لأن البيانات تم حذفها بنجاح من القاعدة
        }
    }

    console.log('✅ تم حذف صورة المعرض بنجاح');

    return NextResponse.json({
      success: true,
      message: 'تم حذف صورة المعرض بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ عام في حذف صورة المعرض:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
