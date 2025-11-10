import jwt, { SignOptions } from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
}

export class JWTService {
  /**
   * 生成访问令牌
   */
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * 生成刷新令牌
   * 添加随机字符串确保每次生成的token都是唯一的
   */
  static generateRefreshToken(payload: JWTPayload): string {
    // 添加随机jti(JWT ID)确保每次生成的token都不同
    const jti = randomBytes(16).toString('hex');
    return jwt.sign({ ...payload, jti }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  /**
   * 验证令牌
   */
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * 解码令牌(不验证)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * 计算刷新令牌过期时间
   */
  static getRefreshTokenExpiryDate(): Date {
    const expiresIn = String(REFRESH_TOKEN_EXPIRES_IN);
    const match = expiresIn.match(/^(\d+)([dhms])$/);

    if (!match) {
      // 默认 7 天
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const now = Date.now();
    switch (unit) {
      case 'd':
        return new Date(now + value * 24 * 60 * 60 * 1000);
      case 'h':
        return new Date(now + value * 60 * 60 * 1000);
      case 'm':
        return new Date(now + value * 60 * 1000);
      case 's':
        return new Date(now + value * 1000);
      default:
        return new Date(now + 7 * 24 * 60 * 60 * 1000);
    }
  }
}
