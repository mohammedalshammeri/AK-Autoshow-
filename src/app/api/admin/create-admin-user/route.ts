// Create Admin User API Endpoint
// This creates the admin user in the admin_users table

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  console.log('🚀 Creating admin user...');

  try {
    // Check if user already exists
    const existingUserRes = await query(
      `SELECT * FROM admin_users WHERE email = $1 LIMIT 1`,
      ['admin@carshowx.app']
    );
    
    const existingUser = existingUserRes.rows[0];

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
      full_name: 'System Administrator',
      role: 'super_admin',
      permissions: JSON.stringify({
        users: ['create', 'read', 'update', 'delete'],
        cars: ['create', 'read', 'update', 'delete'],
        events: ['create', 'read', 'update', 'delete'],
        content: ['create', 'read', 'update', 'delete'],
        settings: ['create', 'read', 'update', 'delete'],
        system: ['create', 'read', 'update', 'delete']
      }),
      is_active: true,
      created_by: null,
      last_login: null,
      login_count: 0
    };

    const insertUserRes = await query(
      `INSERT INTO admin_users 
       (email, password_hash, full_name, role, permissions, is_active, created_by, last_login, login_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, email, full_name, role`,
      [
        adminUser.email,
        adminUser.password_hash,
        adminUser.full_name,
        adminUser.role,
        adminUser.permissions,
        adminUser.is_active,
        adminUser.created_by,
        adminUser.last_login,
        adminUser.login_count
      ]
    );

    const newUser = insertUserRes.rows[0];

    console.log('✅ Admin user created successfully!');

    // Log the creation
    try {
      await query(
        `INSERT INTO admin_activity_log (user_id, action, resource_type, details, status, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          newUser.id,
          'user_created',
          'admin_users',
          JSON.stringify({
            email: 'admin@carshowx.app',
            role: 'super_admin',
            created_by: 'system_api'
          }),
          'success'
        ]
      );
    } catch (logError) {
      console.warn('⚠️  Failed to log user creation:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        full_name: newUser.full_name
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
