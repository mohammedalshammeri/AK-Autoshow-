/**
 * Database Setup API - Manual Table Creation
 * Creates admin tables using direct Supabase calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating admin database tables...');

    // Step 1: Create admin user directly (this will create the table if it doesn't exist)
    const hashedPassword = await bcrypt.hash('CarShowX@2025!', 12);
    
    console.log('Creating admin user...');
    const { data: userData, error: userError } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@carshowx.app',
        password_hash: hashedPassword,
        full_name: 'System Administrator',
        role: 'super_admin',
        is_active: true,
        email_verified: true,
        permissions: {
          full_access: true,
          can_manage_users: true,
          can_manage_registrations: true,
          can_manage_events: true,
          can_view_system_logs: true,
          can_change_settings: true
        }
      })
      .select();

    if (userError) {
      console.error('User creation error:', userError);
      
      // If error is because table doesn't exist, provide manual setup instructions
      if (userError.code === 'PGRST116' || userError.message.includes('relation') || userError.message.includes('table')) {
        return NextResponse.json({
          success: false,
          error: 'Database tables do not exist',
          requiresManualSetup: true,
          instructions: {
            message: 'يجب إنشاء الجداول يدوياً في Supabase',
            steps: [
              '1. اذهب إلى https://supabase.com/dashboard/project/bvebeycfhtikfmcyadiy',
              '2. انقر على "SQL Editor"',
              '3. انسخ والصق محتوى ملف admin_setup_clean.sql',
              '4. انقر "RUN"'
            ],
            sqlFile: 'admin_setup_clean.sql'
          }
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to create admin user: ' + userError.message
      }, { status: 500 });
    }

    console.log('✅ Admin user created successfully');

    // Step 2: Verify the user was created
    const { data: verifyUser, error: verifyError } = await supabase
      .from('admin_users')
      .select('email, full_name, role, is_active')
      .eq('email', 'admin@carshowx.app')
      .single();

    if (verifyError || !verifyUser) {
      return NextResponse.json({
        success: false,
        error: 'User creation could not be verified'
      }, { status: 500 });
    }

    console.log('✅ Database setup completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Admin system setup completed!',
      user: verifyUser,
      credentials: {
        email: 'admin@carshowx.app',
        password: 'CarShowX@2025!',
        loginUrl: '/admin/login'
      },
      nextSteps: [
        'Try logging in with the provided credentials',
        'If login fails, the session table may need to be created manually'
      ]
    });

  } catch (error) {
    console.error('Setup error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database setup failed: ' + (error as Error).message,
      suggestion: 'Please create tables manually using admin_setup_clean.sql'
    }, { status: 500 });
  }
}
