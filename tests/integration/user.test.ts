import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../src/app';
import { getResponseData } from '../helpers/response.helper';

describe('User API 集成测试', () => {
  let userId: number;

  const validUser = {
    username: 'testuser123',
    email: 'testuser@example.com',
    website: 'https://example.com',
    phone: '13800138000',
    role: 'user',
  };

  const invalidUser = {
    username: 'ab', // 太短，需要 3-20 位
    email: 'invalid-email',
    phone: '12345', // 格式不符合
    role: 'invalid_role', // 无效角色
  };

  describe('POST /users', () => {
    it('应该成功创建用户', async () => {
      const response = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUser),
      });

      expect(response.status).toBe(201);
      const json = await response.json();
      const data = getResponseData(json);
      expect(data).toHaveProperty('id');
      expect(data.username).toBe(validUser.username);
      expect(data.email).toBe(validUser.email);
      expect(data.website).toBe(validUser.website);
      expect(data.phone).toBe(validUser.phone);
      expect(data.role).toBe(validUser.role);

      userId = data.id;
    });

    it('应该拒绝重复的用户名', async () => {
      const response = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUser),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('应该拒绝重复的邮箱', async () => {
      const response = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'anotheruser',
          email: validUser.email,
          role: 'user',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('应该验证用户名格式', async () => {
      const response = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invalidUser,
          username: 'ab', // 太短
          email: 'valid@example.com',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('应该验证邮箱格式', async () => {
      const response = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'validuser',
          email: 'not-an-email',
          role: 'user',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('应该验证角色枚举值', async () => {
      const response = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'validuser2',
          email: 'user2@example.com',
          role: 'superuser', // 无效角色
        }),
      });

      expect(response.status).toBe(400);
    });

    it('应该允许可选字段为空', async () => {
      const response = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'minimaluser',
          email: 'minimal@example.com',
          role: 'user',
        }),
      });

      expect(response.status).toBe(201);
      const json = await response.json();
      const data = getResponseData(json);
      // DB may return null or undefined for optional fields, accept both
      expect(data.website).toBeFalsy();
      expect(data.phone).toBeFalsy();
    });
  });

  describe('GET /users', () => {
    it('应该获取所有用户列表', async () => {
      const response = await app.request('/users', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      const data = getResponseData(json);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('返回的用户列表包含必要字段', async () => {
      const response = await app.request('/users', {
        method: 'GET',
      });

      const json = await response.json();
      const data = getResponseData(json);
      const user = data[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
    });
  });

  describe('GET /users/:id', () => {
    it('应该获取单个用户信息', async () => {
      const response = await app.request(`/users/${userId}`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      const data = getResponseData(json);
      expect(data.id).toBe(userId);
      expect(data.username).toBe(validUser.username);
      expect(data.email).toBe(validUser.email);
    });

    it('应该对不存在的用户返回 404', async () => {
      const response = await app.request('/users/999999', {
        method: 'GET',
      });

      expect(response.status).toBe(404);
    });

    it('应该对无效的 ID 格式返回错误', async () => {
      const response = await app.request('/users/invalid-id', {
        method: 'GET',
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('PUT /users/:id', () => {
    it('应该成功更新用户信息', async () => {
      const updateData = {
        username: validUser.username,
        email: validUser.email,
        website: 'https://updated.com',
        phone: '13900139000',
        role: 'moderator',
      };

      const response = await app.request(`/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      const data = getResponseData(json);
      expect(data.website).toBe(updateData.website);
      expect(data.phone).toBe(updateData.phone);
      expect(data.role).toBe(updateData.role);
    });

    it('应该拒绝更新为已存在的用户名', async () => {
      // 先创建另一个用户
      await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'otheruser',
          email: 'otheruser@example.com',
          role: 'user',
        }),
      });

      // 尝试将第一个用户的用户名改为已存在的
      const response = await app.request(`/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'otheruser',
          email: validUser.email,
          role: 'user',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('应该对不存在的用户返回 404', async () => {
      const response = await app.request('/users/999999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUser),
      });

      expect(response.status).toBe(404);
    });

    it('应该验证更新数据的格式', async () => {
      const response = await app.request(`/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: validUser.username,
          email: 'invalid-email',
          role: 'user',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /users/:id', () => {
    let deleteUserId: number;

    beforeAll(async () => {
      // 创建一个用于删除的用户
      const response = await app.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'deleteuser',
          email: 'deleteuser@example.com',
          role: 'user',
        }),
      });

      const json = await response.json();
      const data = getResponseData(json);
      deleteUserId = data.id;
    });

    it('应该成功删除用户', async () => {
      const response = await app.request(`/users/${deleteUserId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toHaveProperty('message');

      // 验证用户已删除
      const getResponse = await app.request(`/users/${deleteUserId}`, {
        method: 'GET',
      });
      expect(getResponse.status).toBe(404);
    });

    it('应该对不存在的用户返回 404', async () => {
      const response = await app.request('/users/999999', {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
    });
  });
});
