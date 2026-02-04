import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Get total number of participants
    const totalResult = await query('SELECT COUNT(*) as count FROM registrations');
    const totalParticipants = parseInt(totalResult.rows[0].count);

    // 2. Get car makes distribution
    const carMakesResult = await query(`
      SELECT car_make as make, COUNT(*) as count 
      FROM registrations 
      WHERE car_make IS NOT NULL 
      GROUP BY car_make 
      ORDER BY count DESC
    `);
    const carMakesData = carMakesResult.rows;

    // 3. Get countries distribution
    const countriesResult = await query(`
        SELECT country, COUNT(*) as count
        FROM registrations
        WHERE country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
    `);
    const countriesData = countriesResult.rows;

    // 4. Get car models distribution (Top 10)
    // Note: We group by model AND make to avoid ambiguity if different makes share a model name (rare but good practice)
    // or just display model name as requested. The original code formatted it as "Make Model" or just "Model".
    // Let's stick to the SQL equivalent of the original logic.
    const carModelsResult = await query(`
        SELECT car_model as model, COUNT(*) as count
        FROM registrations
        WHERE car_model IS NOT NULL
        GROUP BY car_model
        ORDER BY count DESC
        LIMIT 10
    `);
    const carModelsData = carModelsResult.rows;

    return NextResponse.json({
      totalParticipants: totalParticipants || 0,
      carMakes: carMakesData,
      countries: countriesData,
      carModels: carModelsData
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}
