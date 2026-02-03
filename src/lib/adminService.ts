// ================================================
// CarShowX Admin System - User Management Service
// Created: November 17, 2025
// Purpose: Complete user management operations
// ================================================

import { supabaseAdmin } from './supabaseAdmin';
import { supabase } from './supabaseClient'; // Ensure supabaseClient exports the initialized Supabase client
import {
  AdminUser,
  AdminSession,
  LoginCredentials,
  LoginResult,
  hashPassword,
  verifyPassword,
  validateAdminUserInput,
  generateSessionToken,
  createAccessToken,
  createRefreshToken,
  AUTH_CONFIG,
} from './auth';

// ================================================
// TYPES & INTERFACES
// ================================================

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'viewer';
  phone?: string;
  avatar_url?: string;
  permissions?: Record<string, any>;
}

export interface UpdateUserInput {
  email?: string;
  full_name?: string;
  role?: 'super_admin' | 'admin' | 'moderator' | 'viewer';
  phone?: string;
  avatar_url?: string;
  permissions?: Record<string, any>;
  is_active?: boolean;
}

export interface UserListFilters {
  role?: string;
  is_active?: boolean;
  search?: string;
  created_after?: Date;
  created_before?: Date;
}

export interface ActivityLogEntry {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: Date;
  status: 'success' | 'failed' | 'warning';
}

// ================================================
// USER AUTHENTICATION
// ================================================

/**
 * Authenticate user login
 */
export async function authenticateUser(
  credentials: LoginCredentials,
  ip_address?: string,
  user_agent?: string
): Promise<LoginResult> {
  try {
    console.log('🔐 Authenticating user:', credentials.email);

    // Validate input
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', credentials.email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      console.log('❌ User not found:', credentials.email);
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(credentials.password, user.password_hash);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', credentials.email);
      
      // Log failed login attempt
      await logActivity({
        user_id: user.id,
        action: 'login_failed',
        resource_type: 'admin_users',
        resource_id: user.id,
        details: { reason: 'invalid_password', ip_address, user_agent },
        status: 'failed'
      });

      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + AUTH_CONFIG.SESSION_TIMEOUT);
    const refreshExpiresAt = credentials.rememberMe 
      ? new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
      : new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('admin_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        refresh_expires_at: refreshExpiresAt.toISOString(),
        ip_address,
        user_agent,
        device_info: { login_time: new Date().toISOString() },
        is_active: true
      })
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Failed to create session:', sessionError);
      return {
        success: false,
        error: 'Failed to create session'
      };
    }

    // Create JWT tokens
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id
    };

    const accessToken = await createAccessToken(jwtPayload);
    const refreshToken = credentials.rememberMe 
      ? await createRefreshToken(jwtPayload)
      : undefined;

    // Update user's last login
    await supabaseAdmin
      .from('admin_users')
      .update({
        last_login: new Date().toISOString(),
        login_count: (user.login_count || 0) + 1
      })
      .eq('id', user.id);

    // Log successful login
    await logActivity({
      user_id: user.id,
      action: 'login_success',
      resource_type: 'admin_users',
      resource_id: user.id,
      details: { ip_address, user_agent, session_id: session.id },
      status: 'success'
    });

    console.log('✅ User authenticated successfully:', user.email);

    return {
      success: true,
      user: user as AdminUser,
      session: session as AdminSession,
      tokens: {
        accessToken,
        refreshToken
      }
    };

  } catch (error) {
    console.error('❌ Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Logout user and invalidate session
 */
export async function logoutUser(sessionToken: string): Promise<boolean> {
  try {
    console.log('🚪 Logging out user session:', sessionToken);

    // Find and deactivate session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken)
      .select('user_id')
      .single();

    if (sessionError) {
      console.error('❌ Failed to logout session:', sessionError);
      return false;
    }

    // Log logout activity
    if (session) {
      await logActivity({
        user_id: session.user_id,
        action: 'logout',
        resource_type: 'admin_users',
        resource_id: session.user_id,
        details: { session_token: sessionToken },
        status: 'success'
      });
    }

    console.log('✅ User logged out successfully');
    return true;

  } catch (error) {
    console.error('❌ Logout error:', error);
    return false;
  }
}

// ================================================
// USER MANAGEMENT
// ================================================

/**
 * Create a new admin user
 */
export async function createUser(
  input: CreateUserInput,
  createdBy: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    console.log('👤 Creating new user:', input.email);

    // Validate input
    const validation = validateAdminUserInput(input);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('admin_users')
      .select('email')
      .eq('email', input.email.toLowerCase())
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists'
      };
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: input.email.toLowerCase(),
        password_hash: passwordHash,
        full_name: input.full_name,
        role: input.role,
        phone: input.phone,
        avatar_url: input.avatar_url,
        permissions: input.permissions || getDefaultPermissions(input.role),
        is_active: true,
        email_verified: true,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create user:', error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }

    // Log user creation
    await logActivity({
      user_id: createdBy,
      action: 'create_user',
      resource_type: 'admin_users',
      resource_id: user.id,
      details: { 
        created_user_email: user.email,
        created_user_role: user.role 
      },
      status: 'success'
    });

    console.log('✅ User created successfully:', user.email);

    return {
      success: true,
      user: user as AdminUser
    };

  } catch (error) {
    console.error('❌ Create user error:', error);
    return {
      success: false,
      error: 'Failed to create user'
    };
  }
}

/**
 * Update an existing user
 */
export async function updateUser(
  userId: string,
  input: UpdateUserInput,
  updatedBy: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    console.log('✏️ Updating user:', userId);

    // Get current user data for logging
    const { data: currentUser } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!currentUser) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (input.email !== undefined) {
      updateData.email = input.email.toLowerCase();
    }
    if (input.full_name !== undefined) {
      updateData.full_name = input.full_name;
    }
    if (input.role !== undefined) {
      updateData.role = input.role;
      updateData.permissions = getDefaultPermissions(input.role);
    }
    if (input.phone !== undefined) {
      updateData.phone = input.phone;
    }
    if (input.avatar_url !== undefined) {
      updateData.avatar_url = input.avatar_url;
    }
    if (input.permissions !== undefined) {
      updateData.permissions = input.permissions;
    }
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }

    // Update user
    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to update user:', error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }

    // Log user update
    await logActivity({
      user_id: updatedBy,
      action: 'update_user',
      resource_type: 'admin_users',
      resource_id: userId,
      details: { 
        updated_fields: Object.keys(updateData),
        target_user_email: user.email 
      },
      status: 'success'
    });

    console.log('✅ User updated successfully:', user.email);

    return {
      success: true,
      user: user as AdminUser
    };

  } catch (error) {
    console.error('❌ Update user error:', error);
    return {
      success: false,
      error: 'Failed to update user'
    };
  }
}

/**
 * Delete (deactivate) a user
 */
export async function deleteUser(
  userId: string,
  deletedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Deleting user:', userId);

    // Get user data for logging
    const { data: user } = await supabaseAdmin
      .from('admin_users')
      .select('email, role')
      .eq('id', userId)
      .single();

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Deactivate user instead of hard delete
    const { error } = await supabaseAdmin
      .from('admin_users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Failed to delete user:', error);
      return {
        success: false,
        error: 'Failed to delete user'
      };
    }

    // Deactivate all user sessions
    await supabaseAdmin
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Log user deletion
    await logActivity({
      user_id: deletedBy,
      action: 'delete_user',
      resource_type: 'admin_users',
      resource_id: userId,
      details: { 
        deleted_user_email: user.email,
        deleted_user_role: user.role 
      },
      status: 'success'
    });

    console.log('✅ User deleted successfully:', user.email);

    return { success: true };

  } catch (error) {
    console.error('❌ Delete user error:', error);
    return {
      success: false,
      error: 'Failed to delete user'
    };
  }
}

/**
 * Get list of users with filtering
 */
export async function getUsers(
  filters: UserListFilters = {},
  limit: number = 50,
  offset: number = 0
): Promise<{ success: boolean; users?: AdminUser[]; total?: number; error?: string }> {
  try {
    console.log('📋 Fetching users with filters:', filters);

    let query = supabase
      .from('admin_users')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters.created_after) {
      query = query.gte('created_at', filters.created_after.toISOString());
    }

    if (filters.created_before) {
      query = query.lte('created_at', filters.created_before.toISOString());
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error('❌ Failed to fetch users:', error);
      return {
        success: false,
        error: 'Failed to fetch users'
      };
    }

    console.log('✅ Fetched users successfully:', users?.length);

    return {
      success: true,
      users: users as AdminUser[],
      total: count || 0
    };

  } catch (error) {
    console.error('❌ Get users error:', error);
    return {
      success: false,
      error: 'Failed to fetch users'
    };
  }
}

// ================================================
// PERMISSION UTILITIES
// ================================================

/**
 * Get default permissions for a role
 */
export function getDefaultPermissions(role: string): Record<string, any> {
  const permissions: Record<string, Record<string, any>> = {
    super_admin: {
      full_access: true,
      can_manage_users: true,
      can_manage_registrations: true,
      can_manage_events: true,
      can_view_system_logs: true,
      can_change_settings: true
    },
    admin: {
      can_manage_registrations: true,
      can_manage_events: true,
      can_view_users: true,
      can_view_activity_logs: true
    },
    moderator: {
      can_view_registrations: true,
      can_update_registrations: true,
      can_view_events: true
    },
    viewer: {
      can_view_registrations: true,
      can_view_events: true
    }
  };

  return permissions[role] || permissions.viewer;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: AdminUser, permission: string): boolean {
  // Super admin has all permissions
  if (user.role === 'super_admin') {
    return true;
  }

  // Check specific permissions
  return user.permissions && user.permissions[permission] === true;
}

// ================================================
// ACTIVITY LOGGING
// ================================================

/**
 * Log admin activity
 */
export async function logActivity(activity: {
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  status?: 'success' | 'failed' | 'warning';
}): Promise<void> {
  try {
    await supabaseAdmin
      .from('admin_activity_log')
      .insert({
        user_id: activity.user_id,
        action: activity.action,
        resource_type: activity.resource_type,
        resource_id: activity.resource_id,
        details: activity.details,
        ip_address: activity.ip_address,
        status: activity.status || 'success',
        created_at: new Date().toISOString()
      });

    console.log('📝 Activity logged:', activity.action);

  } catch (error) {
    console.error('❌ Failed to log activity:', error);
  }
}

/**
 * Get activity logs
 */
export async function getActivityLogs(
  filters: {
    user_id?: string;
    action?: string;
    resource_type?: string;
    date_from?: Date;
    date_to?: Date;
  } = {},
  limit: number = 100
): Promise<ActivityLogEntry[]> {
  try {
    let query = supabase
      .from('admin_activity_log')
      .select(`
        *,
        admin_users!admin_activity_log_user_id_fkey (
          full_name,
          email
        )
      `);

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from.toISOString());
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to.toISOString());
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Failed to fetch activity logs:', error);
      return [];
    }

    return data.map(log => ({
      ...log,
      user_name: log.admin_users?.full_name || log.admin_users?.email || 'Unknown User'
    })) as ActivityLogEntry[];

  } catch (error) {
    console.error('❌ Get activity logs error:', error);
    return [];
  }
}

// ================================================
// EXPORT ALL SERVICES
// ================================================

export default {
  // Authentication
  authenticateUser,
  logoutUser,
  
  // User Management
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  
  // Permissions
  getDefaultPermissions,
  hasPermission,
  
  // Activity Logging
  logActivity,
  getActivityLogs,
};
