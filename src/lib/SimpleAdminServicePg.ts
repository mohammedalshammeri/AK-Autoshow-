import { query } from './db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import crypto from 'crypto';

export class AdminService {
  /**
   * Authenticate user with email/password
   */
  async authenticateUser(email: string, password: string, rememberMe: boolean, deviceInfo: any, ipAddress: string) {
    try {
      console.log('🔐 Authenticating user:', email);

      // Find user
      const usersRes = await query(
        `SELECT * FROM admin_users WHERE email = $1 AND is_active = true LIMIT 1`,
        [email.toLowerCase()]
      );
      
      const user = usersRes.rows[0];

      if (!user) {
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
      }

      // Create session first to get session ID
      const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
      
      // Use a random UUID as temporary token to respect UNIQUE constraint
      const tempToken = crypto.randomUUID();

      const sessionRes = await query(
        `INSERT INTO admin_sessions (user_id, session_token, expires_at, ip_address, user_agent, device_info, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          user.id,
          tempToken,
          expiresAt.toISOString(),
          ipAddress,
          deviceInfo?.browser || 'Unknown',
          JSON.stringify(deviceInfo),
          true
        ]
      );
      
      const session = sessionRes.rows[0];

      if (!session) {
        console.error('❌ Failed to create session');
        return { success: false, error: 'Failed to create session' };
      }

      // Create JWT token with session ID
      const sessionToken = await this.createJWTToken({
        userId: user.id,
        sessionId: session.id,
        email: user.email,
        role: user.role
      });

      // Update session with JWT token
      const updateSessionRes = await query(
        `UPDATE admin_sessions SET session_token = $1 WHERE id = $2`,
        [sessionToken, session.id]
      );

      // Update user login info
      await query(
        `UPDATE admin_users SET last_login = $1, login_count = COALESCE(login_count, 0) + 1 WHERE id = $2`,
        [new Date().toISOString(), user.id]
      );

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
      // Fetch session and join with admin_users
      const res = await query(
        `SELECT s.*, 
                u.id as user_id, u.email, u.full_name, u.role, u.permissions, u.is_active as user_is_active
         FROM admin_sessions s
         JOIN admin_users u ON s.user_id = u.id
         WHERE s.session_token = $1 AND s.is_active = true AND s.expires_at > NOW()`,
        [token]
      );

      const sessionData = res.rows[0];

      if (!sessionData) {
        return { success: false, error: 'Invalid session' };
      }

      // Reconstruct user object from flat result
      const user = {
        id: sessionData.user_id,
        email: sessionData.email,
        full_name: sessionData.full_name,
        role: sessionData.role,
        permissions: sessionData.permissions,
        is_active: sessionData.user_is_active
      };

      const session = {
        id: sessionData.id,
        user_id: sessionData.user_id,
        session_token: sessionData.session_token,
        expires_at: sessionData.expires_at,
        created_at: sessionData.created_at,
        ip_address: sessionData.ip_address,
        user_agent: sessionData.user_agent,
        device_info: sessionData.device_info,
        is_active: sessionData.is_active
      };

      return { success: true, session, user };
    } catch (error) {
      return { success: false, error: 'Session validation failed' };
    }
  }

  /**
   * Invalidate session (logout)
   */
  async invalidateSession(token: string) {
    try {
      const res = await query(
        `UPDATE admin_sessions SET is_active = false WHERE session_token = $1 RETURNING user_id`,
        [token]
      );
      
      const session = res.rows[0];

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
      let queryText = 'SELECT id, email, full_name, role, is_active, created_at, last_login FROM admin_users';
      const queryParams: any[] = [];
      
      if (filters.role) {
        queryText += ' WHERE role = $1';
        queryParams.push(filters.role);
      }

      queryText += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1);
      queryParams.push(filters.limit || 50);

      if (filters.offset) {
        queryText += ' OFFSET $' + (queryParams.length + 1);
        queryParams.push(filters.offset);
      }

      const res = await query(queryText, queryParams);

      return { success: true, data: res.rows };
    } catch (error) {
      return { success: false, error: 'Failed to fetch users' };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    try {
      const res = await query('SELECT * FROM admin_users WHERE id = $1', [userId]);
      return res.rows[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get session by token
   */
  async getSessionByToken(token: string) {
    try {
      const res = await query('SELECT * FROM admin_sessions WHERE session_token = $1', [token]);
      return res.rows[0] || null;
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
  async logActivity(action: string, resourceType: string, userId: string | undefined, details: any, status: string = 'success') {
    try {
      await query(
        `INSERT INTO admin_activity_log (user_id, action, resource_type, details, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId || null,
          action,
          resourceType,
          typeof details === 'object' ? JSON.stringify(details) : details,
          status,
          new Date().toISOString()
        ]
      );
      console.log('📝 Activity logged:', action);
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
