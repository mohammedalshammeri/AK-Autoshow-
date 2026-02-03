import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

// التحقق من صحة الإدارة
async function verifyAdmin(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('akautoshow-admin-token')?.value;
    
    if (!token) {
      return { isValid: false, error: 'No token found' };
    }

    // التحقق من التوكن (يمكنك تخصيص هذا حسب نظامك)
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: 'Invalid token' };
  }
}

// GET - جلب جميع الرعاة
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 جلب الرعاة (Neon)...');
    
    const result = await query(
      `SELECT * FROM sponsors ORDER BY display_order ASC`
    );

    console.log(`✅ تم جلب ${result.rows.length} راعي`);
    return NextResponse.json({ 
      success: true, 
      sponsors: result.rows || [] 
    });

  } catch (error) {
    console.error('❌ خطأ عام في جلب الرعاة:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطأ داخلي في الخادم' 
    }, { status: 500 });
  }
}

// POST - إضافة راعي جديد
export async function POST(request: NextRequest) {
  try {
    console.log('➕ إضافة راعي جديد...');
    
    const body = await request.json();
    const { name, logo_url, website_url, description, tier, display_order, is_active } = body;

    if (!name || !logo_url) {
      return NextResponse.json({ 
        success: false, 
        error: 'اسم الراعي وصورة اللوجو مطلوبة' 
      }, { status: 400 });
    }

    const sql = `
      INSERT INTO sponsors (name, logo_url, website_url, description, tier, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      name.trim(),
      logo_url.trim(),
      website_url?.trim() || null,
      description?.trim() || null,
      tier || 'gold',
      display_order || 0,
      is_active !== undefined ? is_active : true
    ];

    const result = await query(sql, values);
    const newSponsor = result.rows[0];

    console.log('✅ تم إضافة راعي جديد:', newSponsor.name);
    return NextResponse.json({ 
      success: true, 
      sponsor: newSponsor,
      message: 'تم إضافة الراعي بنجاح' 
    });

  } catch (error) {
    console.error('❌ خطأ عام في إضافة راعي:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'خطأ داخلي في الخادم' 
    }, { status: 500 });
  }
}

// PUT - تحديث راعي موجود
export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ تحديث راعي...');
    
    const body = await request.json();
    const { id, name, logo_url, website_url, description, tier, display_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'معرف الراعي مطلوب' 
      }, { status: 400 });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name) { updates.push(`name = $${paramIndex++}`); values.push(name.trim()); }
    if (logo_url) { updates.push(`logo_url = $${paramIndex++}`); values.push(logo_url.trim()); }
    if (website_url !== undefined) { updates.push(`website_url = $${paramIndex++}`); values.push(website_url?.trim() || null); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description?.trim() || null); }
    if (tier) { updates.push(`tier = $${paramIndex++}`); values.push(tier); }
    if (display_order !== undefined) { updates.push(`display_order = $${paramIndex++}`); values.push(display_order); }
    if (is_active !== undefined) { updates.push(`is_active = $${paramIndex++}`); values.push(is_active); }

    if (updates.length === 0) {
       return NextResponse.json({ success: true, message: 'No changes provided' });
    }

    values.push(id);
    const sql = `
      UPDATE sponsors 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, values);
    
    if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Sponsor not found' }, { status: 404 });
    }

    const updatedSponsor = result.rows[0];

    console.log('✅ تم تحديث راعي:', updatedSponsor.name);
    return NextResponse.json({ 
      success: true, 
      sponsor: updatedSponsor,
      message: 'تم تحديث الراعي بنجاح' 
    });

  } catch (error) {
    console.error('❌ خطأ عام في تحديث راعي:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'خطأ داخلي في الخادم' 
    }, { status: 500 });
  }
}

// DELETE - حذف راعي
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ حذف راعي...');
    
    let id: string | null = null;
    
    try {
      const body = await request.json();
      id = body.id;
    } catch {
      const url = new URL(request.url);
      id = url.searchParams.get('id');
    }

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'معرف الراعي مطلوب' 
      }, { status: 400 });
    }

    const result = await query(`DELETE FROM sponsors WHERE id = $1 RETURNING name`, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'الراعي غير موجود' 
      }, { status: 404 });
    }

    console.log('✅ تم حذف راعي:', result.rows[0].name);
    return NextResponse.json({ 
      success: true,
      message: 'تم حذف الراعي بنجاح' 
    });

  } catch (error) {
    console.error('❌ خطأ عام في حذف راعي:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'خطأ داخلي في الخادم' 
    }, { status: 500 });
  }
}
