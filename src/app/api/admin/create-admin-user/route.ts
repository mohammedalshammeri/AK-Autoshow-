// Create Admin User API Endpoint
// This creates the admin user in the admin_users table

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  console.log('🚀 Creating admin user...');

  try {
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@carshowx.app')
      .single();

    if (existingUser) {
      console.log('✅ Admin user already exists');
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          is_active: existingUser.is_active
        }
      });
    }

    // Hash password
    const password = 'CarShowX@2025!';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('🔐 Password hashed successfully');

    // Create admin user
    const adminUser = {
      email: 'admin@carshowx.app',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'super_admin',
      permissions: {
        users: ['create', 'read', 'update', 'delete'],
        cars: ['create', 'read', 'update', 'delete'],
        events: ['create', 'read', 'update', 'delete'],
        content: ['create', 'read', 'update', 'delete'],
        settings: ['create', 'read', 'update', 'delete'],
        system: ['create', 'read', 'update', 'delete']
      },
      is_active: true,
      created_by: null,
      last_login: null,
      login_count: 0
    };

    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .insert(adminUser)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create admin user:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create admin user: ' + error.message
      }, { status: 500 });
    }

    console.log('✅ Admin user created successfully!');

    // Log the creation
    const { error: logError } = await supabaseAdmin
      .from('admin_activity_log')
      .insert({
        user_id: data.id,
        action: 'user_created',
        entity_type: 'admin_users',
        entity_id: data.id,
        details: {
          email: 'admin@carshowx.app',
          role: 'super_admin',
          created_by: 'system_api'
        },
        status: 'success'
      });

    if (logError) {
      console.warn('⚠️  Failed to log user creation:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name
      },
      credentials: {
        email: 'admin@carshowx.app',
        password: 'CarShowX@2025!'
      }
    });

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
