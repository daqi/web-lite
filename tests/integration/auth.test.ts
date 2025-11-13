import { describe, it, expect } from 'vitest';
import app from '../../src/app';
import { getResponseData } from '../helpers/response.helper';

describe('Auth API 集成测试', () => {
  let accessToken: string;
  let refreshToken: string;

  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  describe('POST /auth/register', () => {
    it('应该成功注册新用户', async () => {
      const response = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.status).toBe(201);

      const json = await response.json();
      const data = getResponseData(json);
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
      expect(data.user.username).toBe(testUser.username);
      expect(data.user.email).toBe(testUser.email);
      expect(data.user).not.toHaveProperty('password');

      // 保存 token 供后续测试使用
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
    });

    it('应该拒绝重复的用户名', async () => {
      const response = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json).toHaveProperty('code');
      expect(json.code).toBeGreaterThanOrEqual(400);
    });

    it('应该验证必填字段', async () => {
      const response = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('应该成功登录', async () => {
      // 登录第一个测试中注册的testuser
      const response = await app.request('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test Client',
        },
        body: JSON.stringify({
          username: testUser.username,
          password: testUser.password,
        }),
      });

      expect(response.status).toBe(200);

      const json = await response.json();
      const data = getResponseData(json);
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');

      // 更新 token
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
    });

    it('应该拒绝错误的密码', async () => {
      const response = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testUser.username,
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('应该拒绝不存在的用户', async () => {
      const response = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'nonexistent',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('应该返回已认证用户的信息', async () => {
      const response = await app.request('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);

      const json = await response.json();
      const data = getResponseData(json);
      expect(data).toHaveProperty('id');
      expect(data.username).toBe(testUser.username);
    });

    it('应该拒绝无效的 token', async () => {
      const response = await app.request('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid_token',
        },
      });

      expect(response.status).toBe(401);
    });

    it('应该拒绝缺少 token 的请求', async () => {
      const response = await app.request('/auth/profile', {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('应该成功刷新 access token', async () => {
      const response = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(200);

      const json = await response.json();
      const data = getResponseData(json);
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');

      // 验证新 token 是否有效
      const profileResponse = await app.request('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      });

      expect(profileResponse.status).toBe(200);

      // 更新 token
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
    });

    it('应该拒绝无效的 refresh token', async () => {
      const response = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid_refresh_token' }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('应该成功登出', async () => {
      const response = await app.request('/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json).toHaveProperty('message');
    });

    it('登出后 refresh token 应该失效', async () => {
      const response = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/logout-all', () => {
    it('应该登出所有设备', async () => {
      // 先登录获取新的 token
      const loginResponse = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testUser.username,
          password: testUser.password,
        }),
      });

      const loginJson = await loginResponse.json();
      const loginData = getResponseData(loginJson);
      const newAccessToken = loginData.accessToken;

      // 登出所有设备
      const response = await app.request('/auth/logout-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
        },
      });

      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json).toHaveProperty('message');
    });
  });
});
