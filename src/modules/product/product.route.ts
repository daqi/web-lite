import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { ProductService } from './product.service';
import { createProductSchema, updateProductSchema } from '../../validators/product.validator';

/**
 * 商品管理 Routes
 * Auto-generated from model definition
 */
const app = new Hono();
const productService = new ProductService();

// 获取所有商品管理
app.get('/', async (c) => {
  const items = await productService.getAll();
  return c.json(items);
});

// 获取单个商品管理
app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const item = await productService.getById(id);

  if (!item) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(item);
});

// 创建商品管理
app.post('/', vValidator('json', createProductSchema), async (c) => {
  const data = c.req.valid('json');
  const item = await productService.create(data);
  return c.json(item, 201);
});

// 更新商品管理
app.put('/:id', vValidator('json', updateProductSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');
  const item = await productService.update(id, data);

  if (!item) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(item);
});

// 删除商品管理
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const success = await productService.delete(id);

  if (!success) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json({ message: 'Product deleted successfully' });
});

export const productRoute = app;
