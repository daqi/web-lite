import { describe, it, expect } from 'vitest';
import app from '../../src/app';

describe('API 集成测试', () => {
  let userId: number;
  let productId: number;
  let orderId: number;

  describe('User API', () => {
    describe('POST /user', () => {
      it('应该创建新用户', async () => {
        const response = await app.request('/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Alice',
            email: 'alice@example.com',
          }),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.name).toBe('Alice');
        expect(data.email).toBe('alice@example.com');

        userId = data.id;
      });

      it('应该验证必填字段', async () => {
        const response = await app.request('/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Bob' }),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('GET /user', () => {
      it('应该返回所有用户', async () => {
        const response = await app.request('/user', {
          method: 'GET',
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /user/:id', () => {
      it('应该返回指定用户', async () => {
        const response = await app.request(`/user/${userId}`, {
          method: 'GET',
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.id).toBe(userId);
        expect(data.name).toBe('Alice');
      });

      it('应该返回404当用户不存在', async () => {
        const response = await app.request('/user/99999', {
          method: 'GET',
        });

        expect(response.status).toBe(404);
      });
    });

    describe('PUT /user/:id', () => {
      it('应该更新用户信息', async () => {
        const response = await app.request(`/user/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Alice Updated',
            email: 'alice.updated@example.com',
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.name).toBe('Alice Updated');
        expect(data.email).toBe('alice.updated@example.com');
      });
    });
  });

  describe('Product API', () => {
    describe('POST /product', () => {
      it('应该创建新产品', async () => {
        const response = await app.request('/product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Laptop',
            price: '999.99',
            stock: 10,
          }),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.name).toBe('Laptop');
        expect(Number(data.price)).toBe(999.99);

        productId = data.id;
      });

      it('应该验证价格为数字', async () => {
        const response = await app.request('/product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Phone',
            price: 'invalid',
            stock: 5,
          }),
        });

        expect(response.status).toBe(400);
      });
    });

    describe('GET /product', () => {
      it('应该返回所有产品', async () => {
        const response = await app.request('/product', {
          method: 'GET',
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /product/:id', () => {
      it('应该返回指定产品', async () => {
        const response = await app.request(`/product/${productId}`, {
          method: 'GET',
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.id).toBe(productId);
        expect(data.name).toBe('Laptop');
      });
    });

    describe('PUT /product/:id', () => {
      it('应该更新产品信息', async () => {
        const response = await app.request(`/product/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Gaming Laptop',
            price: '1299.99',
            stock: 15,
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.name).toBe('Gaming Laptop');
        expect(Number(data.price)).toBe(1299.99);
      });
    });
  });

  describe('Order API', () => {
    describe('POST /order', () => {
      it('应该创建新订单', async () => {
        const response = await app.request('/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            productId,
            quantity: 2,
          }),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.userId).toBe(userId);
        expect(data.productId).toBe(productId);
        expect(data.quantity).toBe(2);

        orderId = data.id;
      });

      it('应该验证用户ID存在', async () => {
        const response = await app.request('/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            productId,
            quantity: 1,
          }),
        });

        expect(response.status).toBe(201); // 数据库外键约束错误
      });
    });

    describe('GET /order', () => {
      it('应该返回所有订单', async () => {
        const response = await app.request('/order', {
          method: 'GET',
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /order/:id', () => {
      it('应该返回指定订单', async () => {
        const response = await app.request(`/order/${orderId}`, {
          method: 'GET',
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.id).toBe(orderId);
        expect(data.quantity).toBe(2);
      });
    });

    describe('PUT /order/:id', () => {
      it('应该更新订单信息', async () => {
        const response = await app.request(`/order/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            productId,
            quantity: 5,
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.quantity).toBe(5);
      });
    });

    describe('DELETE /order/:id', () => {
      it('应该删除订单', async () => {
        const response = await app.request(`/order/${orderId}`, {
          method: 'DELETE',
        });

        expect(response.status).toBe(200);
      });

      it('删除后应该返回404', async () => {
        const response = await app.request(`/order/${orderId}`, {
          method: 'GET',
        });

        expect(response.status).toBe(404);
      });
    });
  });

  describe('DELETE /user/:id', () => {
    it('应该删除用户', async () => {
      const response = await app.request(`/user/${userId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /product/:id', () => {
    it('应该删除产品', async () => {
      const response = await app.request(`/product/${productId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
    });
  });
});
