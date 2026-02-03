/**
 * Simple Database Setup API
 * Creates admin tables directly using Supabase client
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
    console.log('🚀 Setting up CarShowX admin database...');

    // Step 1: Try to create admin_users table using INSERT to test if it exists
    try {
      // If this succeeds, table exists, if it fails, we need to create it
      const { data: testUser } = await supabase
        .from('admin_users')
        .select('id')
        .limit(1)
        .single();
      
      console.log('✅ admin_users table already exists');
    } catch (error) {
      // Table doesn't exist, we need to create it manually
      console.log('⚠️ admin_users table does not exist');
      
      return NextResponse.json({
        success: false,
        error: 'Database tables need to be created manually',
        instructions: {
          step1: 'Go to https://supabase.com/dashboard/project/bvebeycfhtikfmcyadiy',
          step2: 'Click on SQL Editor in the left sidebar', 
          step3: 'Copy and paste the SQL from QUICK_DATABASE_SETUP.md',
          step4: 'Click RUN to execute the SQL',
          step5: 'Then call this API again'
        }
      }, { status: 400 });
    }

    // Step 2: Create admin user if table exists
    const hashedPassword = await bcrypt.hash('CarShowX@2025!', 12);
    
    const { error: insertError } = await supabase
      .from('admin_users')
      .upsert({
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
      }, {
        onConflict: 'email'
      });

    if (insertError) {
      console.error('❌ Failed to create admin user:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create admin user: ' + insertError.message
      }, { status: 500 });
    }

    // Step 3: Verify the setup
    const { data: users, error: verifyError } = await supabase
      .from('admin_users')
      .select('email, full_name, role, is_active');

    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: 'Setup verification failed: ' + verifyError.message
      }, { status: 500 });
    }

    console.log('✅ Database setup completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Admin system setup completed successfully!',
      users: users,
      testCredentials: {
        email: 'admin@carshowx.app',
        password: 'CarShowX@2025!',
        loginUrl: 'http://localhost:3000/admin/login'
      }
    });

  } catch (error) {
    console.error('❌ Database setup error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database setup failed: ' + (error as Error).message,
      suggestion: 'Please create tables manually using the SQL from QUICK_DATABASE_SETUP.md'
    }, { status: 500 });
  }
}
