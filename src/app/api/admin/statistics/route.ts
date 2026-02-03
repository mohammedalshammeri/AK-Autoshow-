import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Make sure to use a service role key with appropriate permissions

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or service role key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Check if user is authenticated and has admin role
    // You might want to add your authentication logic here
    
    // 1. Get total number of participants
    const { count: totalParticipants, error: countError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // 2. Get car makes distribution
    const { data: carMakes, error: makesError } = await supabase
      .from('registrations')
      .select('car_make')
      .not('car_make', 'is', null);

    if (makesError) throw makesError;

    // Process car makes data
    const carMakesCount = carMakes.reduce((acc: Record<string, number>, { car_make }) => {
      if (car_make) {
        acc[car_make] = (acc[car_make] || 0) + 1;
      }
      return acc;
    }, {});

    const carMakesData = Object.entries(carMakesCount)
      .map(([make, count]) => ({
        make,
        count: count as number
      }))
      .sort((a, b) => b.count - a.count);

    // 3. Get countries distribution
    const { data: countriesData, error: countriesError } = await supabase
      .from('registrations')
      .select('country')
      .not('country', 'is', null);

    if (countriesError) throw countriesError;

    // Process countries data
    const countriesCount = countriesData.reduce((acc: Record<string, number>, { country }) => {
      if (country) {
        acc[country] = (acc[country] || 0) + 1;
      }
      return acc;
    }, {});

    const countries = Object.entries(countriesCount)
      .map(([country, count]) => ({
        country,
        count: count as number
      }))
      .sort((a, b) => b.count - a.count);

    // 4. Get car models distribution
    const { data: carModels, error: modelsError } = await supabase
      .from('registrations')
      .select('car_model, car_make')
      .not('car_model', 'is', null);

    if (modelsError) throw modelsError;

    // Process car models data
    const carModelsCount = carModels.reduce((acc: Record<string, number>, { car_model, car_make }) => {
      if (car_model) {
        const key = car_make ? `${car_make} ${car_model}` : car_model;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    const carModelsData = Object.entries(carModelsCount)
      .map(([model, count]) => ({
        model,
        count: count as number
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Limit to top 10 models

    return NextResponse.json({
      totalParticipants: totalParticipants || 0,
      carMakes: carMakesData,
      countries,
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
