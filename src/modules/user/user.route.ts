import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { UserService } from './user.service';
import { createUserSchema, updateUserSchema } from '../../validators/user.validator';

/**
 * 用户管理 Routes
 * Auto-generated from model definition
 */
const app = new Hono();
const userService = new UserService();

// 获取所有用户管理
app.get('/', async (c) => {
  const items = await userService.getAll();
  return c.json(items);
});

// 获取单个用户管理
app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const item = await userService.getById(id);

  if (!item) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(item);
});

// 创建用户管理
app.post('/', vValidator('json', createUserSchema), async (c) => {
  const data = c.req.valid('json');
  const item = await userService.create(data);
  return c.json(item, 201);
});

// 更新用户管理
app.put('/:id', vValidator('json', updateUserSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');
  const item = await userService.update(id, data);

  if (!item) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(item);
});

// 删除用户管理
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const success = await userService.delete(id);

  if (!success) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ message: 'User deleted successfully' });
});

export const userRoute = app;
