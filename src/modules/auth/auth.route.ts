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
    return c.json(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return c.json({ error: message }, 400);
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
    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return c.json({ error: message }, 401);
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
    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    return c.json({ error: message }, 401);
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
    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return c.json({ error: message }, 400);
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
    return c.json({ message: 'Logged out from all devices' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return c.json({ error: message }, 400);
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
    return c.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    return c.json({ error: message }, 404);
  }
});

export default route;
