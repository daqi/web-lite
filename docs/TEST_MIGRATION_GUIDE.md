# 测试迁移指南

## 概述

由于 API 响应格式的更新，所有测试需要进行相应的调整以适配新的响应结构。

## 新的响应格式

之前的响应：
```json
{
  "id": 1,
  "name": "test"
}
```

新的响应格式：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "test"
  }
}
```

## 测试辅助工具

在 `tests/helpers/response.helper.ts` 中提供了以下辅助函数：

```typescript
import { getResponseData } from '../helpers/response.helper';

// 获取响应中的数据
const json = await response.json();
const data = getResponseData(json); // 提取 data 字段
```

## 迁移步骤

### 1. 导入辅助函数

在测试文件开头添加：
```typescript
import { getResponseData } from '../helpers/response.helper';
```

### 2. 更新数据获取方式

**之前：**
```typescript
const data = await response.json();
expect(data.id).toBe(1);
```

**之后：**
```typescript
const json = await response.json();
const data = getResponseData(json);
expect(data.id).toBe(1);
```

### 3. 完整示例

**之前的测试：**
```typescript
it('应该成功创建用户', async () => {
  const response = await app.request('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  expect(response.status).toBe(201);
  const data = await response.json();
  expect(data).toHaveProperty('id');
  expect(data.username).toBe(userData.username);
  userId = data.id;
});
```

**之后的测试：**
```typescript
import { getResponseData } from '../helpers/response.helper';

it('应该成功创建用户', async () => {
  const response = await app.request('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  expect(response.status).toBe(201);
  const json = await response.json();
  const data = getResponseData(json);
  expect(data).toHaveProperty('id');
  expect(data.username).toBe(userData.username);
  userId = data.id;
});
```

## 需要更新的测试文件

- [x] `tests/integration/order.test.ts` - 已更新
- [ ] `tests/integration/user.test.ts`
- [ ] `tests/integration/auth.test.ts`
- [ ] `tests/integration/product.test.ts`
- [ ] `tests/integration/category.test.ts`

## 批量替换模式

可以使用以下查找替换模式（VS Code 正则表达式）：

**查找：**
```
const data = await response\.json\(\);
```

**替换为：**
```
const json = await response.json();
const data = getResponseData(json);
```

**注意：** 在文件顶部添加导入语句：
```typescript
import { getResponseData } from '../helpers/response.helper';
```

## 验证

更新后运行测试验证：
```bash
npm run test
```

确保所有测试通过后，迁移完成。
