import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '../../validators/auth.validator';
import { authMiddleware } from '../../middlewares/auth';

const service = new AuthService();
const route = new Hono();

/**
 * POST /auth/register
 * 用户注册
 */
route.post('/register', vValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json');

  try {
    const result = await service.register(body);
    return c.apiCreated(result, 'User registered successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return c.apiError(message, 400);
  }
});

/**
 * POST /auth/login
 * 用户登录
 */
route.post('/login', vValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');

  // 获取设备信息(User-Agent)
  const deviceInfo = c.req.header('User-Agent') || 'Unknown Device';

  try {
    const result = await service.login(body, deviceInfo);
    return c.apiSuccess(result, 'Login successful');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return c.apiUnauthorized(message);
  }
});

/**
 * POST /auth/refresh
 * 刷新访问令牌
 */
route.post('/refresh', vValidator('json', refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');

  try {
    const result = await service.refreshToken(refreshToken);
    return c.apiSuccess(result, 'Token refreshed successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    return c.apiUnauthorized(message);
  }
});

/**
 * POST /auth/logout
 * 登出(需要认证)
 */
route.post('/logout', authMiddleware, vValidator('json', refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');

  try {
    await service.logout(refreshToken);
    return c.apiSuccess(null, 'Logged out successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return c.apiError(message, 400);
  }
});

/**
 * POST /auth/logout-all
 * 登出所有设备(需要认证)
 */
route.post('/logout-all', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    await service.logoutAll(user.userId);
    return c.apiSuccess(null, 'Logged out from all devices');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return c.apiError(message, 400);
  }
});

/**
 * GET /auth/profile
 * 获取当前用户信息(需要认证)
 */
route.get('/profile', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    const profile = await service.getProfile(user.userId);
    return c.apiSuccess(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    return c.apiNotFound(message);
  }
});

export default route;
