import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { OrderService } from './order.service';
import { createOrderSchema, updateOrderSchema } from '../../validators/order.validator';

const service = new OrderService();
const route = new Hono();

route.get('/', async (c) => {
  const items = await service.list();
  return c.json(items);
});

route.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const item = await service.get(id);
  return c.json(item);
});

route.post('/', vValidator('json', createOrderSchema), async (c) => {
  const body = c.req.valid('json');
  const item = await service.create(body);
  return c.json(item, 201);
});

route.put('/:id', vValidator('json', updateOrderSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
  const item = await service.update(id, body);
  return c.json(item);
});

route.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await service.delete(id);
  return c.json({ success: true });
});

export default route;
