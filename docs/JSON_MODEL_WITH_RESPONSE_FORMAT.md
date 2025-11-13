# JSON 模型驱动开发与标准响应格式

## 概述

本项目采用 JSON 模型驱动开发方式，同时使用统一的标准响应格式（code、data、message）。

## 响应格式规范

所有自动生成的路由都遵循以下标准响应格式：

```json
{
  "code": 200,
  "message": "Success",
  "data": { /* 实际数据 */ }
}
```

### 状态码和消息

- **200** - `Success` - 操作成功
- **201** - `Created successfully` - 创建成功
- **400** - `Bad request` - 请求参数错误
- **401** - `Unauthorized` - 未授权
- **403** - `Forbidden` - 禁止访问
- **404** - `Not found` - 资源不存在
- **422** - `Validation error` - 数据验证失败
- **500** - `Internal server error` - 服务器内部错误

## JSON 模型定义

### 模型示例

```json
{
  "name": "product",
  "description": "商品管理",
  "tableName": "product",
  "fields": [
    {
      "name": "id",
      "type": "serial",
      "description": "商品ID",
      "primaryKey": true
    },
    {
      "name": "name",
      "type": "varchar",
      "length": 100,
      "description": "商品名称",
      "required": true
    },
    {
      "name": "price",
      "type": "decimal",
      "precision": 10,
      "scale": 2,
      "description": "价格",
      "required": true
    }
  ],
  "api": {
    "list": { "enabled": true },
    "get": { "enabled": true },
    "create": { "enabled": true },
    "update": { "enabled": true },
    "delete": { "enabled": true }
  },
  "generate": {
    "schema": true,
    "repository": true,
    "service": true,
    "route": true,
    "validator": true
  }
}
```

## 自动生成的路由

### GET /products - 获取列表

**请求：**
```bash
GET /products
```

**响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    { "id": 1, "name": "Product 1", "price": "9.99" },
    { "id": 2, "name": "Product 2", "price": "19.99" }
  ]
}
```

### GET /products/:id - 获取单个资源

**请求：**
```bash
GET /products/1
```

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Product 1",
    "price": "9.99"
  }
}
```

**失败响应（404）：**
```json
{
  "code": 404,
  "message": "Product not found"
}
```

### POST /products - 创建资源

**请求：**
```bash
POST /products
Content-Type: application/json

{
  "name": "New Product",
  "price": "29.99"
}
```

**成功响应（201）：**
```json
{
  "code": 201,
  "message": "Created successfully",
  "data": {
    "id": 3,
    "name": "New Product",
    "price": "29.99"
  }
}
```

**验证失败响应（422）：**
```json
{
  "code": 422,
  "message": "Validation error",
  "data": [
    { "field": "name", "message": "Name is required" },
    { "field": "price", "message": "Price must be a valid number" }
  ]
}
```

### PUT /products/:id - 更新资源

**请求：**
```bash
PUT /products/1
Content-Type: application/json

{
  "price": "39.99"
}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Product 1",
    "price": "39.99"
  }
}
```

**失败响应（404）：**
```json
{
  "code": 404,
  "message": "Product not found"
}
```

### DELETE /products/:id - 删除资源

**请求：**
```bash
DELETE /products/1
```

**成功响应：**
```json
{
  "code": 200,
  "message": "Deleted successfully",
  "data": null
}
```

**失败响应（404）：**
```json
{
  "code": 404,
  "message": "Product not found"
}
```

## 生成代码

### 1. 创建 JSON 模型

在 `src/models/` 目录下创建模型文件，例如 `product.model.json`：

```json
{
  "name": "product",
  "description": "商品管理",
  "tableName": "product",
  "fields": [
    // ... 字段定义
  ]
}
```

### 2. 生成代码

运行生成命令：

```bash
pnpm run generate:model product
```

这将自动生成以下文件，所有文件都使用新的响应格式：

- `src/db/schema/product.ts` - 数据库 Schema
- `src/validators/product.validator.ts` - 数据验证器
- `src/modules/product/product.repository.ts` - 数据仓库
- `src/modules/product/product.service.ts` - 业务逻辑
- `src/modules/product/product.route.ts` - **使用标准响应格式的路由**

### 3. 生成的路由代码示例

```typescript
import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { ProductService } from './product.service';
import { createProductSchema, updateProductSchema } from '../../validators/product.validator';

const app = new Hono();
const productService = new ProductService();

// 获取所有商品管理
app.get('/', async (c) => {
  const items = await productService.getAll();
  return c.apiSuccess(items);
});

// 获取单个商品管理
app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const item = await productService.getById(id);

  if (!item) {
    return c.apiNotFound('Product not found');
  }

  return c.apiSuccess(item);
});

// 创建商品管理
app.post('/', vValidator('json', createProductSchema), async (c) => {
  const data = c.req.valid('json');
  const item = await productService.create(data);
  return c.apiCreated(item);
});

// 更新商品管理
app.put('/:id', vValidator('json', updateProductSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');
  const item = await productService.update(id, data);

  if (!item) {
    return c.apiNotFound('Product not found');
  }

  return c.apiSuccess(item);
});

// 删除商品管理
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const success = await productService.delete(id);

  if (!success) {
    return c.apiNotFound('Product not found');
  }

  return c.apiSuccess(null, 'Deleted successfully');
});

export const productRoute = app;
```

## 自定义路由

如果需要添加自定义逻辑，可以在生成的路由文件中添加：

```typescript
// 自定义路由 - 按价格范围查询
app.get('/price-range', async (c) => {
  const min = Number(c.req.query('min')) || 0;
  const max = Number(c.req.query('max')) || 999999;

  try {
    const products = await productService.getByPriceRange(min, max);
    return c.apiSuccess(products);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Query failed';
    return c.apiError(message, 400);
  }
});

// 批量操作
app.post('/batch-update', async (c) => {
  const body = await c.req.json();

  try {
    const result = await productService.batchUpdate(body.ids, body.updates);
    return c.apiSuccess(result, 'Batch update completed');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Batch update failed';
    return c.apiError(message, 400);
  }
});
```

## 最佳实践

### 1. 保持错误消息为英文

```typescript
// ✅ 好的做法
return c.apiNotFound('Product not found');
return c.apiError('Invalid product ID', 400);

// ❌ 避免使用中文
return c.apiNotFound('商品不存在');
```

### 2. 使用合适的响应方法

```typescript
// 查询操作
return c.apiSuccess(data);

// 创建操作
return c.apiCreated(newItem);

// 更新操作
return c.apiSuccess(updatedItem);

// 删除操作
return c.apiSuccess(null, 'Deleted successfully');

// 资源未找到
return c.apiNotFound('Resource not found');

// 验证错误
return c.apiValidationError('Validation failed', errors);

// 未授权
return c.apiUnauthorized('Authentication required');
```

### 3. 错误处理

```typescript
app.post('/', async (c) => {
  try {
    const data = c.req.valid('json');
    const item = await service.create(data);
    return c.apiCreated(item);
  } catch (error) {
    // 提取有意义的错误信息
    const message = error instanceof Error ? error.message : 'Creation failed';

    // 根据错误类型返回合适的状态码
    if (message.includes('duplicate')) {
      return c.apiError('Resource already exists', 409);
    }

    return c.apiError(message, 400);
  }
});
```

### 4. 验证错误详情

```typescript
app.post('/', vValidator('json', createSchema), async (c) => {
  // Valibot 验证器会自动处理验证错误
  // 如果需要手动验证
  const errors = manualValidate(data);

  if (errors.length > 0) {
    return c.apiValidationError('Validation failed', errors);
  }

  // 继续处理...
});
```

## 模型配置选项

### API 端点配置

可以在模型中配置哪些 API 端点需要生成：

```json
{
  "api": {
    "list": { "enabled": true },
    "get": { "enabled": true },
    "create": { "enabled": true },
    "update": { "enabled": true },
    "delete": { "enabled": false }  // 禁用删除端点
  }
}
```

### 生成配置

控制生成哪些文件：

```json
{
  "generate": {
    "schema": true,
    "repository": true,
    "service": true,
    "route": true,
    "validator": true
  }
}
```

## 前端集成示例

### TypeScript/Axios

```typescript
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

async function getProducts() {
  const response = await axios.get<ApiResponse<Product[]>>('/products');

  if (response.data.code === 200) {
    return response.data.data;
  } else {
    throw new Error(response.data.message);
  }
}

async function createProduct(product: NewProduct) {
  try {
    const response = await axios.post<ApiResponse<Product>>('/products', product);

    if (response.data.code === 201) {
      console.log('Created:', response.data.data);
      return response.data.data;
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiResponse;
      console.error('Error:', apiError.message);

      if (apiError.code === 422 && apiError.data) {
        console.error('Validation errors:', apiError.data);
      }
    }
    throw error;
  }
}
```

## 总结

通过 JSON 模型驱动开发和统一的响应格式：

1. ✅ **一致性** - 所有 API 返回相同的数据结构
2. ✅ **自动化** - 从模型定义自动生成完整的 CRUD 操作
3. ✅ **标准化** - 遵循 RESTful API 最佳实践
4. ✅ **英文错误** - 保持错误消息为英文，便于国际化
5. ✅ **可维护** - 修改模型即可更新所有相关代码
6. ✅ **类型安全** - TypeScript 类型定义确保类型正确性

更多信息请参考：
- [响应格式文档](./RESPONSE_FORMAT.md)
- [JSON 模型文档](./JSON_MODEL.md)
- [快速开始指南](./QUICKSTART.md)
