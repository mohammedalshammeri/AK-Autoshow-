/**
 * CarShowX Database Setup Utility
 * 
 * This script sets up the admin system tables in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Setting up CarShowX Admin System Database...\n');
  
  try {
    // Read the SQL setup file
    const sqlSetupPath = path.join(process.cwd(), 'database', 'admin_system_setup.sql');
    const sqlSetupContent = fs.readFileSync(sqlSetupPath, 'utf8');
    
    console.log('📝 Executing database schema setup...');
    
    // Execute the SQL setup
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlSetupContent
    });
    
    if (error) {
      console.error('❌ Database setup failed:', error);
      
      // Try executing individual statements
      console.log('🔄 Attempting to execute statements individually...');
      
      const statements = sqlSetupContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const [index, statement] of statements.entries()) {
        try {
          console.log(`   Executing statement ${index + 1}/${statements.length}...`);
          
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql_query: statement + ';'
          });
          
          if (stmtError) {
            console.warn(`⚠️ Statement ${index + 1} failed:`, stmtError.message);
          } else {
            console.log(`   ✅ Statement ${index + 1} executed successfully`);
          }
        } catch (stmtErr) {
          if (stmtErr instanceof Error) {
            console.warn(`⚠️ Statement ${index + 1} failed:`, stmtErr.message);
          } else {
            console.warn(`⚠️ Statement ${index + 1} failed with an unknown error.`);
          }
        }
      }
    } else {
      console.log('✅ Database schema setup completed successfully');
    }
    
    // Now create test users
    console.log('\n👥 Creating test users...');
    
    const testUsersPath = path.join(process.cwd(), 'database', 'create_test_users.sql');
    const testUsersContent = fs.readFileSync(testUsersPath, 'utf8');
    
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql_query: testUsersContent
    });
    
    if (usersError) {
      console.error('❌ Test users creation failed:', usersError);
    } else {
      console.log('✅ Test users created successfully');
    }
    
    // Verify setup by checking tables
    console.log('\n🔍 Verifying database setup...');
    
    const tables = ['admin_users', 'admin_sessions', 'admin_activity_log', 'role_permissions', 'password_reset_tokens'];
    
    for (const tableName of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.log(`❌ Table '${tableName}': ${tableError.message}`);
      } else {
        console.log(`✅ Table '${tableName}': OK`);
      }
    }
    
    // Check test users
    const { data: users, error: userError } = await supabase
      .from('admin_users')
      .select('email, full_name, role, is_active');
    
    if (userError) {
      console.error('❌ Could not fetch users:', userError);
    } else {
      console.log('\n👥 Created admin users:');
      users?.forEach(user => {
        console.log(`   • ${user.email} (${user.role}) - ${user.is_active ? 'Active' : 'Inactive'}`);
      });
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Super Admin: admin@carshowx.app');
    console.log('   Admin: test@carshowx.app');
    console.log('   Moderator: moderator@carshowx.app');
    console.log('   Password: CarShowX@2025!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Create exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  try {
    const { error } = await supabase.rpc('exec', { sql: createFunctionSQL });
    if (error) {
      console.log('Note: Could not create exec_sql function, trying direct execution...');
    }
  } catch (err) {
    console.log('Note: Could not create exec_sql function, trying direct execution...');
  }
}

// Run setup
async function main() {
  await createExecSqlFunction();
  await setupDatabase();
}

if (require.main === module) {
  main().catch(console.error);
}

export { setupDatabase };
