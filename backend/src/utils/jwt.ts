import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthUser } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'medicore_super_secret_jwt_access_key_2026_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'medicore_super_secret_refresh_token_key_2026_prod';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export function generateAccessToken(user: AuthUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function generateRefreshToken(userId: string): { refreshToken: string; tokenHash: string; expiresAt: Date } {
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN as any });
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  // Calculate 7 days expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return { refreshToken, tokenHash, expiresAt };
}

export function hashRefreshToken(refreshToken: string): string {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
}
