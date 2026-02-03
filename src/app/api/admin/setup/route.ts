/**
 * CarShowX Admin System - Direct Database Setup
 * Creates tables and test user directly using raw SQL
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up admin system database...');

    // Step 1: Create admin_users table
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer')),
        permissions JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP WITH TIME ZONE,
        login_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: tableError } = await supabaseAdmin.rpc('exec', {
      sql: createUsersTableSQL
    });

    // If exec function doesn't exist, try raw query
    if (tableError && tableError.message.includes('exec')) {
      console.log('Creating tables using direct method...');
      
      // Try to create using Supabase schema builder equivalent
      const { error: directError } = await supabaseAdmin
        .from('admin_users')
        .select('count(*)')
        .limit(0);

      if (directError && directError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Admin tables do not exist. Please run the SQL setup manually.',
          instructions: [
            '1. Go to Supabase Dashboard > SQL Editor',
            '2. Copy and run the SQL from: database/quick_admin_setup.sql',
            '3. Then try this endpoint again'
          ],
          sqlFile: 'database/quick_admin_setup.sql'
        }, { status: 400 });
      }
    }

    console.log('✅ Admin tables exist or created successfully');

    // Step 2: Create test admin user
    const hashedPassword = await bcrypt.hash('CarShowX@2025!', 12);
    
    const { data: existingUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', 'admin@carshowx.app')
      .single();

    if (!existingUser) {
      console.log('👤 Creating admin user...');
      
      const { error: insertError } = await supabaseAdmin
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
        });

      if (insertError) {
        console.error('❌ Failed to create admin user:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create admin user: ' + insertError.message
        }, { status: 500 });
      }

      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Step 3: Verify setup
    const { data: users, error: verifyError } = await supabaseAdmin
      .from('admin_users')
      .select('email, full_name, role, is_active');

    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: 'Setup verification failed: ' + verifyError.message
      }, { status: 500 });
    }

    console.log('🎉 Admin system setup completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Admin system setup completed successfully',
      users: users,
      testCredentials: {
        email: 'admin@carshowx.app',
        password: 'CarShowX@2025!',
        note: 'Use these credentials to test the login'
      }
    });

  } catch (error) {
    console.error('❌ Database setup error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database setup failed: ' + (error as Error).message
    }, { status: 500 });
  }
}
