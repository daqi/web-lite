import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/app';
import { getResponseData } from '../helpers/response.helper';

describe('Order API 集成测试', () => {
  let userId: number;
  let orderId: number;
  const suffix = Date.now().toString().slice(-5);

  beforeAll(async () => {
    // 创建一个用户用于下单（确保唯一）
    const res = await app.request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `orderuser${suffix}`,
        email: `orderuser${suffix}@example.com`,
        role: 'user',
      }),
    });
    const json = await res.json();
    const data = getResponseData(json);
    userId = data.id;
  });

  it('应该成功创建订单', async () => {
    // 构造符合验证器 /^ORD-[0-9]{8}$/ 的 orderNo
    const orderNo = `ORD-${('00000000' + (Date.now() % 1e8)).slice(-8)}`;
    const payload = {
      orderNo,
      userId,
      totalAmount: '49.99',
      status: 'pending',
    };

    const response = await app.request('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201);

    const json = await response.json();
    const data = getResponseData(json);
    expect(data).toHaveProperty('id');
    expect(data.userId).toBe(userId);
    orderId = data.id;
  });

  it('应该拒绝无效的 userId', async () => {
    const response = await app.request('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNo: `ORD-${Date.now()}`, userId: 999999, totalAmount: '10.00' }),
    });

    expect(response.status).toBe(400);
  });

  it('GET /orders 返回列表', async () => {
    const response = await app.request('/orders', { method: 'GET' });
    expect(response.status).toBe(200);
    const json = await response.json();
    const data = getResponseData(json);
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /orders/:id 返回单个订单', async () => {
    if (!orderId) return; // order 未创建，跳过后续断言
    const response = await app.request(`/orders/${orderId}`, { method: 'GET' });
    expect(response.status).toBe(200);
    const json = await response.json();
    const data = getResponseData(json);
    expect(data.id).toBe(orderId);
  });

  it('PUT /orders/:id 应该更新订单状态', async () => {
    if (!orderId) return; // order 未创建，跳过后续断言
    const response = await app.request(`/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    const data = getResponseData(json);
    expect(data.status).toBe('completed');
  });

  it('DELETE /orders/:id 应该删除订单', async () => {
    if (!orderId) return; // order 未创建，跳过后续断言
    const response = await app.request(`/orders/${orderId}`, { method: 'DELETE' });
    expect(response.status).toBe(200);
    const getRes = await app.request(`/orders/${orderId}`, { method: 'GET' });
    expect(getRes.status).toBe(404);
  });
});
