import { describe, it, expect } from 'vitest';
import app from '../../src/app';

describe('Category API 集成测试', () => {
  let categoryId: number;
  const suffix = Date.now();

  it('应该成功创建分类', async () => {
    const payload = {
      name: `Integration Cat ${suffix}`,
      slug: `integration-cat-${suffix}`,
      description: 'desc',
      order: 0,
    };
    const response = await app.request('/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.name).toBe(payload.name);
    categoryId = data.id;
  });

  it('应该拒绝重复的 name 或 slug', async () => {
    const response = await app.request('/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Integration Cat ${suffix}`,
        slug: `integration-cat-${suffix}`,
        order: 0,
      }),
    });

    expect(response.status).toBe(400);
  });

  it('GET /categories 返回列表', async () => {
    const response = await app.request('/categories', { method: 'GET' });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('GET /categories/:id 返回单个分类', async () => {
    const response = await app.request(`/categories/${categoryId}`, { method: 'GET' });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe(categoryId);
  });

  it('PUT /categories/:id 应该更新分类', async () => {
    const response = await app.request(`/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Integration Cat Updated ${suffix}`,
        slug: `integration-cat-updated-${suffix}`,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe(`Integration Cat Updated ${suffix}`);
  });

  it('DELETE /categories/:id 应该删除分类', async () => {
    const response = await app.request(`/categories/${categoryId}`, { method: 'DELETE' });
    expect(response.status).toBe(200);
    const getRes = await app.request(`/categories/${categoryId}`, { method: 'GET' });
    expect(getRes.status).toBe(404);
  });
});
