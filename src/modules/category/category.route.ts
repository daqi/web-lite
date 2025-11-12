import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { CategoryService } from './category.service';
import { createCategorySchema, updateCategorySchema } from '../../validators/category.validator';

/**
 * 商品分类 Routes
 * Auto-generated from model definition
 */
const app = new Hono();
const categoryService = new CategoryService();

// 获取所有商品分类
app.get('/', async (c) => {
  const items = await categoryService.getAll();
  return c.json(items);
});

// 获取单个商品分类
app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const item = await categoryService.getById(id);

  if (!item) {
    return c.json({ error: 'Category not found' }, 404);
  }

  return c.json(item);
});

// 创建商品分类
app.post('/', vValidator('json', createCategorySchema), async (c) => {
  const data = c.req.valid('json');
  const item = await categoryService.create(data);
  return c.json(item, 201);
});

// 更新商品分类
app.put('/:id', vValidator('json', updateCategorySchema), async (c) => {
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');
  const item = await categoryService.update(id, data);

  if (!item) {
    return c.json({ error: 'Category not found' }, 404);
  }

  return c.json(item);
});

// 删除商品分类
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const success = await categoryService.delete(id);

  if (!success) {
    return c.json({ error: 'Category not found' }, 404);
  }

  return c.json({ message: 'Category deleted successfully' });
});

export const categoryRoute = app;
