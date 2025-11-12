# 🎯 JSON 模型字段配置完整指南

## 支持的字段属性

### 1. **length** - 字符串长度

用于 `string` 类型字段，指定 varchar 的最大长度。

**配置：**
```json
{
  "name": "username",
  "type": "string",
  "length": 50,
  "required": true
}
```

**生成的 Schema：**
```typescript
username: varchar('username', { length: 50 }).notNull()
```

**默认值：** 255

---

### 2. **precision & scale** - 小数精度

用于 `decimal` 类型字段，控制数字的总位数和小数位数。

**配置：**
```json
{
  "name": "price",
  "type": "decimal",
  "precision": 10,
  "scale": 2,
  "required": true
}
```

**生成的 Schema：**
```typescript
price: decimal('price', { precision: 10, scale: 2 }).notNull()
```

**生成的 Validator：**
```typescript
price: v.pipe(v.string(), v.regex(/^\d+(\.\d{1,2})?$/))
```

**说明：**
- `precision`: 总位数（整数部分 + 小数部分），范围 1-65
- `scale`: 小数位数，范围 0-30
- decimal 在数据库存储为 string，避免浮点数精度问题
- validator 根据 scale 自动生成对应的正则表达式

**默认值：** precision: 10, scale: 2

---

### 3. **validation.enum** - 枚举值

用于限制字段只能取指定的值。

**配置：**
```json
{
  "name": "status",
  "type": "string",
  "length": 20,
  "required": true,
  "default": "pending",
  "validation": {
    "enum": ["pending", "paid", "shipped", "completed", "cancelled"]
  }
}
```

**生成的 Schema：**
```typescript
status: varchar('status', { length: 20 }).notNull().default('pending')
```

**生成的 Validator：**
```typescript
status: v.picklist(['pending', 'paid', 'shipped', 'completed', 'cancelled'])
```

**说明：**
- 支持字符串和数字枚举
- 使用 Valibot 的 `picklist` 进行严格验证
- 在 API 请求时会自动验证值是否在枚举范围内

---

### 4. **validation.regex** - 正则表达式验证

用于自定义字符串格式验证。

**用户名验证：**
```json
{
  "name": "username",
  "type": "string",
  "length": 50,
  "required": true,
  "validation": {
    "regex": "^[a-zA-Z0-9_]{3,20}$"
  },
  "description": "3-20位字母数字下划线"
}
```

**生成的 Validator：**
```typescript
username: v.pipe(v.string(), v.regex(/^[a-zA-Z0-9_]{3,20}$/))
```

**手机号验证：**
```json
{
  "name": "phone",
  "type": "string",
  "validation": {
    "regex": "^1[3-9]\\d{9}$"
  }
}
```

**生成的 Validator：**
```typescript
phone: v.pipe(v.string(), v.regex(/^1[3-9]\d{9}$/))
```

**注意**：
- 正则表达式不需要包含开头和结尾的 `/`
- 特殊字符需要转义，如 `\\d` 表示数字

---

### 5. **validation.email & url** - 格式验证

**邮箱验证：**
```json
{
  "name": "email",
  "type": "string",
  "validation": {
    "email": true
  }
}
```

**生成的 Validator：**
```typescript
email: v.pipe(v.string(), v.email())
```

**URL 验证：**
```json
{
  "name": "website",
  "type": "string",
  "validation": {
    "url": true
  }
}
```

**生成的 Validator：**
```typescript
website: v.pipe(v.string(), v.url())
```

---

### 6. **validation.min & max** - 最小/最大值

用于字符串长度或数字范围限制。

**字符串长度：**
```json
{
  "name": "title",
  "type": "string",
  "required": true,
  "validation": {
    "min": 1,
    "max": 200
  }
}
```

**生成的 Validator：**
```typescript
title: v.pipe(v.string(), v.minLength(1), v.maxLength(200))
```

**数字范围：**
```json
{
  "name": "age",
  "type": "integer",
  "validation": {
    "min": 0,
    "max": 150
  }
}
```

**生成的 Validator：**
```typescript
age: v.pipe(v.number(), v.minValue(0), v.maxValue(150))
```

---

## 完整示例

### 订单模型

```json
{
  "name": "Order",
  "description": "订单管理系统",
  "fields": [
    {
      "name": "id",
      "type": "integer",
      "primaryKey": true,
      "autoIncrement": true
    },
    {
      "name": "orderNo",
      "type": "string",
      "length": 50,
      "required": true,
      "unique": true,
      "description": "订单号"
    },
    {
      "name": "status",
      "type": "string",
      "length": 20,
      "required": true,
      "default": "pending",
      "validation": {
        "enum": ["pending", "paid", "shipped", "completed", "cancelled"]
      },
      "description": "订单状态"
    },
    {
      "name": "totalAmount",
      "type": "decimal",
      "precision": 12,
      "scale": 2,
      "required": true,
      "description": "订单总金额"
    },
    {
      "name": "userId",
      "type": "integer",
      "required": true,
      "reference": {
        "table": "users",
        "field": "id"
      },
      "description": "用户ID"
    }
  ]
}
```

### 生成的 Schema

```typescript
export const order = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNo: varchar('orderNo', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  totalAmount: decimal('totalAmount', { precision: 12, scale: 2 }).notNull(),
  userId: integer('userId').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
```

### 生成的 Validator

```typescript
export const createOrderSchema = v.object({
  orderNo: v.string(),
  status: v.picklist(['pending', 'paid', 'shipped', 'completed', 'cancelled']),
  totalAmount: v.pipe(v.string(), v.regex(/^\d+(\.\d{1,2})?$/)),
  userId: v.number(),
});
```

---

## 特性对比表

| 特性 | 配置属性 | 适用类型 | 影响 Schema | 影响 Validator |
|------|---------|---------|------------|---------------|
| 字段长度 | `length` | string | ✅ varchar(n) | ❌ |
| 小数精度 | `precision`, `scale` | decimal | ✅ decimal(p,s) | ✅ regex 验证 |
| 枚举值 | `validation.enum` | string, integer | ❌ | ✅ picklist |
| 正则验证 | `validation.regex` | string, text | ❌ | ✅ regex |
| 邮箱验证 | `validation.email` | string | ❌ | ✅ email() |
| URL验证 | `validation.url` | string | ❌ | ✅ url() |
| 长度限制 | `validation.min/max` | string, text | ❌ | ✅ minLength/maxLength |
| 数值范围 | `validation.min/max` | integer | ❌ | ✅ minValue/maxValue |

---

## 最佳实践

### 1. 用户模型 - 综合使用各种验证

```json
{
  "name": "User",
  "description": "用户管理",
  "fields": [
    {
      "name": "id",
      "type": "integer",
      "primaryKey": true,
      "autoIncrement": true
    },
    {
      "name": "username",
      "type": "string",
      "length": 50,
      "required": true,
      "unique": true,
      "validation": {
        "regex": "^[a-zA-Z0-9_]{3,20}$"
      },
      "description": "用户名（3-20位字母数字下划线）"
    },
    {
      "name": "email",
      "type": "string",
      "length": 100,
      "required": true,
      "unique": true,
      "validation": {
        "email": true
      }
    },
    {
      "name": "website",
      "type": "string",
      "length": 200,
      "validation": {
        "url": true
      }
    },
    {
      "name": "phone",
      "type": "string",
      "length": 20,
      "validation": {
        "regex": "^1[3-9]\\d{9}$"
      }
    },
    {
      "name": "role",
      "type": "string",
      "length": 20,
      "required": true,
      "default": "user",
      "validation": {
        "enum": ["user", "admin", "moderator"]
      }
    }
  ]
}
```

### 2. 订单状态使用枚举
```json
{
  "name": "status",
  "type": "string",
  "length": 20,
  "validation": {
    "enum": ["pending", "processing", "completed", "cancelled"]
  }
}
```

### 2. 金额使用合适的精度
```json
{
  "name": "price",
  "type": "decimal",
  "precision": 10,
  "scale": 2  // 两位小数足够大多数场景
}
```

### 3. 字符串长度根据实际需求设置
```json
{
  "name": "username",
  "type": "string",
  "length": 50,  // 不要使用默认的 255
  "validation": {
    "min": 3,
    "max": 20
  }
}
```

### 4. SKU 等特殊字段
```json
{
  "name": "sku",
  "type": "string",
  "length": 100,
  "unique": true,
  "validation": {
    "min": 1,
    "max": 100
  }
}
```

---

## 🎉 总结

通过这些配置选项，你可以：

- ✅ **精确控制**数据库字段定义
- ✅ **自动生成**对应的验证规则
- ✅ **类型安全**的 API 请求验证
- ✅ **减少 90%** 的手写代码

立即在你的模型中使用这些特性，享受高效开发！🚀
