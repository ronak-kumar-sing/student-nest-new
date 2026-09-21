import jwt from 'jsonwebtoken';

// Secrets configuration
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_fallback_for_build';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_fallback_for_build';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  console.warn('[JWT] WARNING: JWT_SECRET or JWT_REFRESH_SECRET is not configured.');
}

// Access token: 1 hour (must match the httpOnly cookie maxAge in login/refresh routes)
// Refresh token: 30 days
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh tokens for a user
 */
export function generateTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>): TokenPair {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET as jwt.Secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY as any
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET as jwt.Secret, {
    expiresIn: REFRESH_TOKEN_EXPIRY as any
  });

  return { accessToken, refreshToken };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Access token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Invalid access token');
    }
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Invalid refresh token');
    }
    return null;
  }
}

/**
 * Decode token without verification (useful for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get token expiry date
 */
export function getTokenExpiry(token: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return new Date(decoded.exp * 1000);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return expiry < new Date();
}

/**
 * Extract JWT access token from request (Authorization header or httpOnly cookie)
 */
export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}
