import { Context, Next } from 'hono';
import { JWTService, JWTPayload } from '../utils/jwt';

declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

/**
 * JWT 认证中间件
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = JWTService.verifyToken(token);
    c.set('user', payload);
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    return c.json({ error: message }, 401);
  }
}

/**
 * 可选认证中间件 - 不强制要求认证
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = JWTService.verifyToken(token);
      c.set('user', payload);
    } catch {
      // 忽略错误,继续执行
    }
  }

  await next();
}
