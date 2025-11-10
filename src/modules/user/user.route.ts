import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { UserService } from './user.service';
import { createUserSchema, updateUserSchema } from '../../validators/user.validator';

const service = new UserService();
const route = new Hono();

route.get('/', async (c) => {
  const user = await service.list();
  return c.json(user);
});

route.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const user = await service.get(id);
    return c.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Not found';
    return c.json({ error: message }, 404);
  }
});

route.post('/', vValidator('json', createUserSchema), async (c) => {
  const body = c.req.valid('json');
  const user = await service.create(body);
  return c.json(user, 201);
});

route.put('/:id', vValidator('json', updateUserSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
  const user = await service.update(id, body);
  return c.json(user);
});

route.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await service.delete(id);
  return c.json({ success: true });
});

export default route;
