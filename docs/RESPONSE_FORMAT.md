# API 响应规范文档

## 概述

本项目使用统一的响应格式来规范所有 API 接口的返回数据结构，提高接口的一致性和可维护性。

## 响应格式

所有 API 响应都遵循以下格式：

```typescript
{
  "code": number,     // 业务状态码
  "message": string,  // 响应消息
  "data": any         // 响应数据（可选）
}
```

### 字段说明

- **code**: 业务状态码，表示请求的处理结果
- **message**: 人类可读的响应消息，用于描述请求结果
- **data**: 实际的响应数据，可以是任何类型（对象、数组、字符串等），某些情况下可以为空

## 状态码定义

### 成功状态码

| 状态码 | 说明 |
|-------|------|
| 200 | 操作成功 |
| 201 | 创建成功 |

### 客户端错误状态码

| 状态码 | 说明 |
|-------|------|
| 400 | 请求参数错误 |
| 401 | 未授权，请先登录 |
| 403 | 没有权限访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 数据验证失败 |

### 服务器错误状态码

| 状态码 | 说明 |
|-------|------|
| 500 | 服务器内部错误 |
| 503 | 服务暂时不可用 |

## 使用方法

### 1. 在路由中使用

所有路由处理器都可以通过 Context 对象访问响应方法：

```typescript
import { Hono } from 'hono';

const app = new Hono();

// 成功响应
app.get('/users', async (c) => {
  const users = await getUsers();
  return c.apiSuccess(users, '获取用户列表成功');
});

// 创建成功响应
app.post('/users', async (c) => {
  const user = await createUser(data);
  return c.apiCreated(user, '创建用户成功');
});

// 错误响应
app.get('/users/:id', async (c) => {
  const user = await getUser(id);
  if (!user) {
    return c.apiNotFound('用户不存在');
  }
  return c.apiSuccess(user);
});

// 未授权响应
app.get('/admin', async (c) => {
  if (!isAuthenticated) {
    return c.apiUnauthorized('请先登录');
  }
  // ...
});

// 验证错误响应
app.post('/users', async (c) => {
  const errors = validateData(data);
  if (errors.length > 0) {
    return c.apiValidationError('数据验证失败', errors);
  }
  // ...
});
```

### 2. Context 响应方法

| 方法 | 参数 | 说明 |
|-----|------|------|
| `c.apiSuccess(data?, message?)` | data: 响应数据<br>message: 消息（默认：'操作成功'） | 返回成功响应（200） |
| `c.apiCreated(data?, message?)` | data: 响应数据<br>message: 消息（默认：'创建成功'） | 返回创建成功响应（201） |
| `c.apiError(message, code?, data?)` | message: 错误消息<br>code: 状态码（默认：400）<br>data: 附加数据 | 返回错误响应 |
| `c.apiUnauthorized(message?)` | message: 消息（默认：'未授权，请先登录'） | 返回未授权响应（401） |
| `c.apiForbidden(message?)` | message: 消息（默认：'没有权限访问'） | 返回禁止访问响应（403） |
| `c.apiNotFound(message?)` | message: 消息（默认：'资源不存在'） | 返回资源未找到响应（404） |
| `c.apiValidationError(message?, data?)` | message: 消息（默认：'数据验证失败'）<br>data: 验证错误详情 | 返回验证错误响应（422） |

### 3. 直接使用工具函数

你也可以在非路由代码中使用响应工具函数：

```typescript
import { success, error, notFound } from '../utils/response';

// 构建响应对象
const response = success({ id: 1, name: 'John' }, '获取成功');
// { code: 200, message: '获取成功', data: { id: 1, name: 'John' } }

const errorResponse = error('参数错误', 400);
// { code: 400, message: '参数错误' }

const notFoundResponse = notFound('用户不存在');
// { code: 404, message: '用户不存在' }
```

## 响应示例

### 成功响应示例

#### 获取列表
```json
{
  "code": 200,
  "message": "获取用户列表成功",
  "data": [
    { "id": 1, "name": "张三", "email": "zhangsan@example.com" },
    { "id": 2, "name": "李四", "email": "lisi@example.com" }
  ]
}
```

#### 获取单个资源
```json
{
  "code": 200,
  "message": "获取用户信息成功",
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 创建资源
```json
{
  "code": 201,
  "message": "创建用户成功",
  "data": {
    "id": 3,
    "name": "王五",
    "email": "wangwu@example.com"
  }
}
```

#### 删除资源
```json
{
  "code": 200,
  "message": "删除用户成功",
  "data": null
}
```

### 错误响应示例

#### 资源未找到
```json
{
  "code": 404,
  "message": "用户不存在"
}
```

#### 未授权
```json
{
  "code": 401,
  "message": "未授权，请先登录"
}
```

#### 验证错误
```json
{
  "code": 422,
  "message": "数据验证失败",
  "data": [
    { "field": "email", "message": "邮箱格式不正确" },
    { "field": "password", "message": "密码长度至少为6位" }
  ]
}
```

#### 服务器错误
```json
{
  "code": 500,
  "message": "服务器内部错误"
}
```

## 最佳实践

### 1. 使用合适的响应方法

根据不同的场景选择合适的响应方法：

- **查询操作**：使用 `c.apiSuccess()`
- **创建操作**：使用 `c.apiCreated()`
- **更新操作**：使用 `c.apiSuccess()`
- **删除操作**：使用 `c.apiSuccess(null, '删除成功')`
- **资源不存在**：使用 `c.apiNotFound()`
- **权限不足**：使用 `c.apiForbidden()`
- **未登录**：使用 `c.apiUnauthorized()`

### 2. 提供清晰的消息

```typescript
// 好的做法 ✅
return c.apiNotFound('ID 为 123 的用户不存在');
return c.apiSuccess(user, '成功获取用户信息');

// 不好的做法 ❌
return c.apiNotFound();
return c.apiSuccess(user);
```

### 3. 错误处理

统一使用 try-catch 处理错误：

```typescript
app.post('/users', async (c) => {
  try {
    const data = c.req.valid('json');
    const user = await userService.create(data);
    return c.apiCreated(user, '创建用户成功');
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建用户失败';
    return c.apiError(message, 400);
  }
});
```

### 4. 验证错误处理

对于数据验证错误，提供详细的错误信息：

```typescript
app.post('/users', async (c) => {
  const validationErrors = validateUserData(data);

  if (validationErrors.length > 0) {
    return c.apiValidationError('数据验证失败', validationErrors);
  }

  // 继续处理...
});
```

## 类型定义

```typescript
// 响应接口
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 响应状态码枚举
enum ResponseCode {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  VALIDATION_ERROR = 422,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}
```

## 配置说明

### 中间件配置

响应中间件已在 `src/app.ts` 中全局启用：

```typescript
import { responseMiddleware } from './middlewares/response';

app.use('*', responseMiddleware);
```

### 全局错误处理

全局错误处理器会自动将错误转换为标准响应格式：

```typescript
app.onError((err, c) => {
  console.error('Error:', err);

  if (err.message.includes('Validation')) {
    return c.apiValidationError(err.message);
  }

  return c.apiError(err.message || '服务器内部错误', ResponseCode.INTERNAL_ERROR);
});
```

## 前端集成

前端可以这样处理响应：

```typescript
// TypeScript 示例
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

async function fetchUsers() {
  const response = await fetch('/api/users');
  const result: ApiResponse<User[]> = await response.json();

  if (result.code === 200) {
    console.log('成功:', result.message);
    console.log('数据:', result.data);
  } else {
    console.error('错误:', result.message);
  }
}
```

## 总结

通过使用统一的响应格式，我们实现了：

1. ✅ **一致性**：所有 API 返回相同的数据结构
2. ✅ **可维护性**：集中管理响应格式和状态码
3. ✅ **开发效率**：简化响应处理，减少重复代码
4. ✅ **用户体验**：提供清晰的错误信息和操作反馈
5. ✅ **类型安全**：TypeScript 类型定义确保类型正确性
