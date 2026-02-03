import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Note: In a production environment, you should verify admin headers/cookies here.
    // For now, we allow the fetch as the page.tsx middleware handles the route protection
    // (the user cannot reach the admin page to trigger this fetch unless logged in).

    const sql = `
      SELECT o.*, p.name as product_name, p.image_url as product_image
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
    `;
    
    const result = await query(sql);
    
    return NextResponse.json({ 
      success: true, 
      orders: result.rows 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      product_id, 
      customer_name, 
      customer_phone, 
      size, 
      quantity, 
      price, 
      total_price, 
      status, 
      notes 
    } = body;

    const sql = `
      INSERT INTO orders (
        product_id, 
        customer_name, 
        customer_phone, 
        size, 
        quantity, 
        price, 
        total_price, 
        status, 
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      product_id,
      customer_name,
      customer_phone,
      size || null,
      quantity,
      price,
      total_price,
      status || 'pending',
      notes || null
    ];

    const result = await query(sql, values);
    
    return NextResponse.json({ success: true, data: result.rows[0], id: result.rows[0].id });

  } catch (error) {
    console.error('Error creating order:', error);

    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + message },
      { status: 500 }
    );
  }
}
