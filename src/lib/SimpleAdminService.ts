/**
 * Simple Admin Service for Testing
 * Direct implementation without complex dependencies
 */

import { supabaseAdmin } from './supabaseAdmin';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export class AdminService {
  /**
   * Authenticate user with email/password
   */
  async authenticateUser(email: string, password: string, rememberMe: boolean, deviceInfo: any, ipAddress: string) {
    try {
      console.log('🔐 Authenticating user:', email);

      // Find user
      const { data: user, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();      if (error || !user) {
        console.log('❌ User not found:', email);
        await this.logActivity('login_failed', 'admin_users', undefined, { email, reason: 'user_not_found', ip_address: ipAddress }, 'failed');
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        console.log('❌ Invalid password for:', email);
        await this.logActivity('login_failed', 'admin_users', user.id, { email, reason: 'invalid_password', ip_address: ipAddress }, 'failed');
        return { success: false, error: 'Invalid credentials' };
      }      // Create session first to get session ID
      const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
      
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('admin_sessions')
        .insert({
          user_id: user.id,
          session_token: 'temp', // Temporary, will update with JWT
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: deviceInfo?.browser || 'Unknown',
          device_info: deviceInfo,
          is_active: true
        })
        .select()
        .single();

      if (sessionError) {
        console.error('❌ Failed to create session:', sessionError);
        return { success: false, error: 'Failed to create session' };
      }      // Create JWT token with session ID
      const sessionToken = await this.createJWTToken({
        userId: user.id,
        sessionId: session.id,
        email: user.email,
        role: user.role
      });// Update session with JWT token
      const { error: updateError } = await supabaseAdmin
        .from('admin_sessions')
        .update({ session_token: sessionToken })
        .eq('id', session.id);

      if (updateError) {
        console.error('❌ Failed to update session with JWT:', updateError);
        return { success: false, error: 'Failed to create session' };
      }

      // Update user login info
      await supabaseAdmin
        .from('admin_users')
        .update({
          last_login: new Date().toISOString(),
          login_count: (user.login_count || 0) + 1
        })
        .eq('id', user.id);

      // Log successful login
      await this.logActivity('login_success', 'admin_users', user.id, { 
        email, 
        ip_address: ipAddress,
        session_id: session.id 
      }, 'success');

      console.log('✅ User authenticated successfully:', email);

      return {
        success: true,
        user,
        session: {
          id: session.id,
          token: sessionToken,
          expires_at: expiresAt
        }
      };

    } catch (error) {
      console.error('❌ Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Validate session token
   */
  async validateSession(token: string) {
    try {
      const { data: session, error } = await supabaseAdmin
        .from('admin_sessions')
        .select('*, admin_users(*)')
        .eq('session_token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        return { success: false, error: 'Invalid session' };
      }

      return { success: true, session, user: session.admin_users };
    } catch (error) {
      return { success: false, error: 'Session validation failed' };
    }
  }

  /**
   * Invalidate session (logout)
   */
  async invalidateSession(token: string) {
    try {
      const { data: session } = await supabaseAdmin
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_token', token)
        .select('user_id')
        .single();

      if (session) {
        await this.logActivity('logout', 'admin_users', session.user_id, { session_token: token }, 'success');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  }

  /**
   * Get all users with filters
   */
  async getAllUsers(filters: { role?: string; limit?: number; offset?: number } = {}) {
    try {
      let query = supabaseAdmin
        .from('admin_users')
        .select('id, email, full_name, role, is_active, created_at, last_login');

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters.limit || 50);

      if (error) {
        return { success: false, error: 'Failed to fetch users' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to fetch users' };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get session by token
   */
  async getSessionByToken(token: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_sessions')
        .select('*')
        .eq('session_token', token)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check user permission
   */
  checkPermission(user: any, permission: string): boolean {
    if (user.role === 'super_admin') {
      return true;
    }

    return user.permissions && user.permissions[permission] === true;
  }

  /**
   * Log activity
   */
  async logActivity(action: string, resourceType: string, userId?: string, details?: any, status: string = 'success') {
    try {
      await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          details,
          status,
          created_at: new Date().toISOString()
        });      console.log('📝 Activity logged:', action);
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
    }
  }

  /**
   * Create JWT token locally
   */
  private async createJWTToken(payload: any): Promise<string> {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'AKAutoshow-Super-Secret-JWT-Key-2025-Admin-System'
    );

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    return jwt;
  }
}
