import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/app';

describe('Product API 集成测试', () => {
  let categoryId: number;
  let productId: number;
  const suffix = Date.now();

  const validProduct = {
    name: 'Test Product',
    description: 'A product used for integration tests',
    price: '9.99',
    stock: 100,
    sku: `TP-${suffix}`,
    isActive: true,
  };

  beforeAll(async () => {
    // 创建分类用于关联，包含必填字段 order
    const res = await app.request('/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Test Category ${suffix}`,
        slug: `test-category-${suffix}`,
        order: 0,
      }),
    });
    const data = await res.json();
    categoryId = data.id;
  });

  describe('POST /products', () => {
    it('应该成功创建商品', async () => {
      const response = await app.request('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validProduct, categoryId }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe(validProduct.name);
      expect(data.price).toBe(validProduct.price);
      expect(data.sku).toBe(validProduct.sku);

      productId = data.id;
    });

    it('应该拒绝缺失必填字段', async () => {
      const response = await app.request('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', price: '', categoryId: null }),
      });

      expect(response.status).toBe(400);
    });

    it('应该拒绝重复 SKU', async () => {
      const response = await app.request('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validProduct, categoryId }),
      });

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('GET /products', () => {
    it('应该返回商品列表', async () => {
      const response = await app.request('/products', { method: 'GET' });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /products/:id', () => {
    it('应该获取单个商品', async () => {
      const response = await app.request(`/products/${productId}`, { method: 'GET' });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(productId);
      expect(data.name).toBe(validProduct.name);
    });

    it('不存在的商品返回 404', async () => {
      const response = await app.request('/products/999999', { method: 'GET' });
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /products/:id', () => {
    it('应该更新商品信息', async () => {
      const response = await app.request(`/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Product', price: '19.99', stock: 50, categoryId }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.name).toBe('Updated Product');
      expect(data.price).toBe('19.99');
    });
  });

  describe('DELETE /products/:id', () => {
    it('应该成功删除商品', async () => {
      const response = await app.request(`/products/${productId}`, { method: 'DELETE' });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('message');

      const getResponse = await app.request(`/products/${productId}`, { method: 'GET' });
      expect(getResponse.status).toBe(404);
    });
  });
});
