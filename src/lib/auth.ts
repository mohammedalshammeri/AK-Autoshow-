// ================================================
// AKAutoshow Admin System - Security & Auth Library
// Created: November 17, 2025
// Purpose: Comprehensive authentication and security utilities
// ================================================

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// ================================================
// CONSTANTS & CONFIGURATION
// ================================================

export const AUTH_CONFIG = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'akautoshow-super-secret-key-2025',
  JWT_EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d',
  
  // Cookie Configuration
  COOKIE_NAME: 'akautoshow_admin_token',
  REFRESH_COOKIE_NAME: 'akautoshow_admin_refresh',
  COOKIE_MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
  
  // Security Configuration
  BCRYPT_ROUNDS: 12,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  
  // Password Requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL: true,
} as const;

// ================================================
// TYPES & INTERFACES
// ================================================

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'viewer';
  permissions: Record<string, any>;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: Date;
  login_count: number;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export interface AdminSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token?: string;
  expires_at: Date;
  refresh_expires_at?: Date;
  ip_address?: string;
  user_agent?: string;
  device_info: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  last_activity: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: AdminUser;
  session?: AdminSession;
  tokens?: {
    accessToken: string;
    refreshToken?: string;
  };
  error?: string;
  requiresPasswordChange?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ================================================
// PASSWORD UTILITIES
// ================================================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(AUTH_CONFIG.BCRYPT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
  }
  
  if (AUTH_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (AUTH_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (AUTH_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (AUTH_CONFIG.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*(),.?":{}|<>';
  
  const allChars = uppercase + lowercase + numbers + special;
  let password = '';
  
  // Ensure at least one character from each required category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// ================================================
// JWT TOKEN UTILITIES
// ================================================

/**
 * Create a JWT access token
 */
export async function createAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = new TextEncoder().encode(AUTH_CONFIG.JWT_SECRET);
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(AUTH_CONFIG.JWT_EXPIRES_IN)    .setIssuer('akautoshow-admin')
    .setAudience('akautoshow-admin-users')
    .sign(secret);
}

/**
 * Create a JWT refresh token
 */
export async function createRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = new TextEncoder().encode(AUTH_CONFIG.JWT_SECRET);
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(AUTH_CONFIG.REFRESH_EXPIRES_IN)    .setIssuer('akautoshow-admin')
    .setAudience('akautoshow-admin-refresh')
    .sign(secret);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(AUTH_CONFIG.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
      // Validate that payload has required properties
    if (payload && 
        typeof payload.userId === 'string' && 
        typeof payload.email === 'string' && 
        typeof payload.role === 'string' && 
        typeof payload.sessionId === 'string') {
      return payload as unknown as JWTPayload;
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from request
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try cookie
  return request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value || null;
}

// ================================================
// SESSION UTILITIES
// ================================================

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Generate device fingerprint
 */
export function generateDeviceFingerprint(request: NextRequest): Record<string, any> {
  return {
    userAgent: request.headers.get('user-agent') || '',
    acceptLanguage: request.headers.get('accept-language') || '',
    acceptEncoding: request.headers.get('accept-encoding') || '',
    connection: request.headers.get('connection') || '',
    timestamp: new Date().toISOString()
  };
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // NextRequest doesn't have ip property, fallback to localhost
  return '127.0.0.1';
}

// ================================================
// COOKIE UTILITIES
// ================================================

/**
 * Set authentication cookies
 */
export async function setAuthCookies(
  accessToken: string, 
  refreshToken?: string,
  rememberMe: boolean = false
) {
  const cookieStore = await cookies();
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: rememberMe ? AUTH_CONFIG.COOKIE_MAX_AGE * 7 : AUTH_CONFIG.COOKIE_MAX_AGE
  };
  
  cookieStore.set(AUTH_CONFIG.COOKIE_NAME, accessToken, cookieOptions);
  
  if (refreshToken) {
    cookieStore.set(AUTH_CONFIG.REFRESH_COOKIE_NAME, refreshToken, {
      ...cookieOptions,
      maxAge: rememberMe ? AUTH_CONFIG.COOKIE_MAX_AGE * 7 : AUTH_CONFIG.COOKIE_MAX_AGE * 7
    });
  }
}

/**
 * Clear authentication cookies
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  
  cookieStore.set(AUTH_CONFIG.COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
  
  cookieStore.set(AUTH_CONFIG.REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

/**
 * Get current auth token from cookies
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_CONFIG.COOKIE_NAME)?.value || null;
  } catch (error) {
    return null;
  }
}

// ================================================
// VALIDATION UTILITIES
// ================================================

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate admin user input
 */
export function validateAdminUserInput(data: {
  email: string;
  password?: string;
  full_name: string;
  role: string;
}): ValidationResult {
  const errors: string[] = [];
  
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }
  
  if (data.password) {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }
  
  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }
  
  if (!['super_admin', 'admin', 'moderator', 'viewer'].includes(data.role)) {
    errors.push('Valid role is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ================================================
// SECURITY HEADERS
// ================================================

/**
 * Get security headers for responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  };
}

// ================================================
// RATE LIMITING UTILITIES
// ================================================

const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

/**
 * Check if IP is rate limited for login attempts
 */
export function isRateLimited(ip: string): boolean {
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    return false;
  }
  
  const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
  
  // Reset counter if lockout period has passed
  if (timeSinceLastAttempt > AUTH_CONFIG.LOCKOUT_DURATION) {
    loginAttempts.delete(ip);
    return false;
  }
  
  return attempts.count >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(ip: string): void {
  const attempts = loginAttempts.get(ip);
  
  if (attempts) {
    attempts.count++;
    attempts.lastAttempt = new Date();
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: new Date() });
  }
}

/**
 * Clear failed login attempts for IP
 */
export function clearFailedLogins(ip: string): void {
  loginAttempts.delete(ip);
}

// ================================================
// EXPORT ALL UTILITIES
// ================================================

export default {
  // Password utilities
  hashPassword,
  verifyPassword,
  validatePassword,
  generateSecurePassword,
  
  // JWT utilities
  createAccessToken,
  createRefreshToken,
  verifyToken,
  extractTokenFromRequest,
  
  // Session utilities
  generateSessionToken,
  generateDeviceFingerprint,
  getClientIP,
  
  // Cookie utilities
  setAuthCookies,
  clearAuthCookies,
  getAuthToken,
  
  // Validation utilities
  validateEmail,
  validateAdminUserInput,
  
  // Security utilities
  getSecurityHeaders,
  isRateLimited,
  recordFailedLogin,
  clearFailedLogins,
  
  // Configuration
  AUTH_CONFIG,
};
