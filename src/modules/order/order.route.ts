import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { OrderService } from './order.service';
import { createOrderSchema, updateOrderSchema } from '../../validators/order.validator';

/**
 * 订单管理 Routes
 * Auto-generated from model definition
 */
const app = new Hono();
const orderService = new OrderService();

// 获取所有订单管理
app.get('/', async (c) => {
  const items = await orderService.getAll();
  return c.json(items);
});

// 获取单个订单管理
app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const item = await orderService.getById(id);

  if (!item) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json(item);
});

// 创建订单管理
app.post('/', vValidator('json', createOrderSchema), async (c) => {
  const data = c.req.valid('json');
  const item = await orderService.create(data);
  return c.json(item, 201);
});

// 更新订单管理
app.put('/:id', vValidator('json', updateOrderSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');
  const item = await orderService.update(id, data);

  if (!item) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json(item);
});

// 删除订单管理
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const success = await orderService.delete(id);

  if (!success) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json({ message: 'Order deleted successfully' });
});

export const orderRoute = app;
