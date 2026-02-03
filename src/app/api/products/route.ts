import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET() {
  try {
    const result = await query(
      `SELECT * FROM products ORDER BY created_at DESC`
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error in GET /api/products:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();

    // Parse JSON fields
    const payload = JSON.parse(String(form.get('payload') || '{}'));

    // رفع الصورة إن وجدت
    const image = form.get('image') as File | null;
    if (image) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
           const result = await uploadToCloudinary(image, 'product-images');
           payload.image_url = result.secure_url;
        } catch (e) {
           console.error('Cloudinary upload failed (image)', e);
           return NextResponse.json({ success: false, error: 'Image upload failed' }, { status: 500 });
        }
      } else {
           console.error('Cloudinary not configured and Supabase Storage fallback removed.');
           return NextResponse.json({ success: false, error: 'Storage not configured' }, { status: 500 });
      }
    }

    // رفع الفيديو إن وجد
    const video = form.get('video') as File | null;
    if (video) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
           const result = await uploadToCloudinary(video, 'product-videos', 'video');
           payload.video_url = result.secure_url;
        } catch (e) {
           console.error('Cloudinary upload failed (video)', e);
           return NextResponse.json({ success: false, error: 'Video upload failed' }, { status: 500 });
        }
      } else {
           return NextResponse.json({ success: false, error: 'Storage not configured' }, { status: 500 });
      }
    }

    // Insert into DB
    const keys = Object.keys(payload);
    // Don't insert keys that don't belong to schema if payload has extra stuff, but assumes payload is clean-ish.
    // Ideally we list columns explicitly.
    // Common columns: name_en, name_ar, description_en, description_ar, price, quantity, category, sizes, image_url, video_url, is_active
    
    // Simplest way is constructing dynamic insert.
    // We should strictly map known fields to avoid SQL injection via column names (though unlikely if not user controlled directly)
    // Or just use the keys from payload if we trust the admin client.

    // Let's assume standard columns:
    const columns = [
        'name_en', 'name_ar', 'description_en', 'description_ar', 
        'price', 'quantity', 'image_url', 'video_url', 
        'sizes', 'is_active', 'category'
    ].filter(col => payload[col] !== undefined);

    const values = columns.map(col => payload[col]);
    const placeholders = columns.map((_, i) => `$${i + 1}`);

    const sql = `
        INSERT INTO products (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
    `;

    const result = await query(sql, values);
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error in POST /api/products:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const form = await request.formData();
    const payload = JSON.parse(String(form.get('payload') || '{}'));
    const { id, ...updateData } = payload;

    // رفع الصورة إن وجدت
    const image = form.get('image') as File | null;
    if (image) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
           const result = await uploadToCloudinary(image, 'product-images');
           updateData.image_url = result.secure_url;
        } catch (e) {
           console.error('Cloudinary upload failed (image PUT)', e);
           return NextResponse.json({ success: false, error: 'Image upload failed' }, { status: 500 });
        }
      }
    }

    // رفع الفيديو إن وجد
    const video = form.get('video') as File | null;
    if (video) {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
           const result = await uploadToCloudinary(video, 'product-videos', 'video');
           updateData.video_url = result.secure_url;
        } catch (e) {
           console.error('Cloudinary upload failed (video PUT)', e);
           return NextResponse.json({ success: false, error: 'Video upload failed' }, { status: 500 });
        }
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Filter updateData to only valid columns if needed, but for now iterate keys
    for (const [key, value] of Object.entries(updateData)) {
        // Simple security check for column names
        if (!/^[a-zA-Z0-9_]+$/.test(key)) continue;
        
        updates.push(`${key} = $${idx++}`);
        values.push(value);
    }

    if (updates.length === 0) {
        return NextResponse.json({ success: true, message: 'No changes' });
    }

    values.push(id);
    const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    
    const result = await query(sql, values);
    
    if (result.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error in PUT /api/products:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    const result = await query(`DELETE FROM products WHERE id = $1 RETURNING id`, [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /api/products:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
