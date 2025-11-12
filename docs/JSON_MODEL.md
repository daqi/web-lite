# JSON 模型定义指南

## 📖 概述

Web Lite 使用 **JSON 格式**定义模型，提供了：

- ✅ **JSON Schema 验证** - 自动验证模型定义的正确性
- ✅ **默认值支持** - 简化配置，只需填写必要字段
- ✅ **类型安全** - JSON Schema 提供完整的类型检查
- ✅ **IDE 友好** - JSON Schema 提供自动补全和错误提示

## 🎯 为什么使用 JSON？

### JSON 格式的优势

| 特性 | 优势 |
|------|------|
| 语法简洁 | ⭐⭐⭐⭐⭐ 更直观易读 |
| 类型检查 | ✅ JSON Schema 验证 |
| 编辑体验 | 无需了解 TypeScript |
| 验证 | 加载时自动验证 |
| 默认值 | 自动应用 |
| 可读性 | ⭐⭐⭐⭐⭐ 最佳 |
| 适合场景 | 所有 CRUD 场景 |

**所有模型定义都使用 JSON 格式！**

## 🚀 快速开始

### 1. 创建 JSON 模型

在 `src/models/` 目录下创建 `*.model.json` 文件：

```json
{
  "name": "Article",
  "description": "文章管理",
  "fields": [
    {
      "name": "id",
      "type": "integer",
      "primaryKey": true,
      "autoIncrement": true
    },
    {
      "name": "title",
      "type": "string",
      "required": true,
      "validation": {
        "min": 1,
        "max": 200
      }
    },
    {
      "name": "content",
      "type": "text",
      "required": true
    }
  ]
}
```

**最小配置**！其他字段会自动应用默认值。

## 📋 完整示例

### 示例 1：博客文章

```json
{
  "name": "Article",
  "tableName": "articles",
  "description": "博客文章",
  "fields": [
    {
      "name": "id",
      "type": "integer",
      "primaryKey": true,
      "autoIncrement": true,
      "description": "文章ID"
    },
    {
      "name": "title",
      "type": "string",
      "required": true,
      "validation": {
        "min": 1,
        "max": 200
      },
      "description": "文章标题"
    },
    {
      "name": "slug",
      "type": "string",
      "required": true,
      "unique": true,
      "description": "URL 标识符"
    },
    {
      "name": "content",
      "type": "text",
      "required": true,
      "description": "文章内容"
    },
    {
      "name": "excerpt",
      "type": "text",
      "description": "文章摘要"
    },
    {
      "name": "authorId",
      "type": "integer",
      "required": true,
      "reference": {
        "table": "users",
        "field": "id",
        "onDelete": "cascade"
      },
      "description": "作者ID"
    },
    {
      "name": "categoryId",
      "type": "integer",
      "reference": {
        "table": "categories",
        "field": "id",
        "onDelete": "set null"
      },
      "description": "分类ID"
    },
    {
      "name": "viewCount",
      "type": "integer",
      "default": 0,
      "description": "浏览次数"
    },
    {
      "name": "isPublished",
      "type": "boolean",
      "default": false,
      "description": "是否发布"
    },
    {
      "name": "publishedAt",
      "type": "datetime",
      "description": "发布时间"
    }
  ],
  "indexes": [
    {
      "name": "idx_article_slug",
      "fields": ["slug"],
      "unique": true
    },
    {
      "name": "idx_article_author",
      "fields": ["authorId"]
    },
    {
      "name": "idx_article_category",
      "fields": ["categoryId"]
    }
  ]
}
```

**注意**：`timestamps`、`api`、`generate` 等配置会自动应用默认值，无需手动填写！

### 示例 2：电商订单

```json
{
  "name": "Order",
  "description": "订单管理",
  "fields": [
    {
      "name": "id",
      "type": "uuid",
      "primaryKey": true,
      "description": "订单ID"
    },
    {
      "name": "orderNo",
      "type": "string",
      "required": true,
      "unique": true,
      "description": "订单号"
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
    },
    {
      "name": "totalAmount",
      "type": "decimal",
      "precision": 10,
      "scale": 2,
      "required": true,
      "validation": {
        "min": 0
      },
      "description": "订单总额"
    },
    {
      "name": "status",
      "type": "string",
      "required": true,
      "default": "pending",
      "validation": {
        "enum": ["pending", "paid", "shipped", "completed", "cancelled"]
      },
      "description": "订单状态"
    },
    {
      "name": "shippingAddress",
      "type": "json",
      "required": true,
      "description": "收货地址"
    },
    {
      "name": "remark",
      "type": "text",
      "description": "订单备注"
    }
  ],
  "indexes": [
    {
      "name": "idx_order_no",
      "fields": ["orderNo"],
      "unique": true
    },
    {
      "name": "idx_order_user",
      "fields": ["userId"]
    }
  ],
  "softDelete": true,
  "api": {
    "create": {
      "auth": true
    },
    "update": {
      "auth": true,
      "roles": ["admin", "manager"]
    },
    "delete": {
      "auth": true,
      "roles": ["admin"]
    }
  }
}
```

## 📚 字段类型

支持的字段类型：

| 类型 | 说明 | 示例 |
|------|------|------|
| `string` | 字符串 | 用户名、邮箱 |
| `text` | 长文本 | 文章内容、描述 |
| `integer` | 整数 | ID、数量、年龄 |
| `decimal` | 小数 | 价格、金额 |
| `boolean` | 布尔值 | 是否激活、是否发布 |
| `date` | 日期 | 生日、截止日期 |
| `datetime` | 日期时间 | 发布时间、登录时间 |
| `json` | JSON 对象 | 配置、元数据 |
| `uuid` | UUID | 唯一标识符 |

## ⚙️ 字段属性

### 基础属性

```json
{
  "name": "email",
  "type": "string",
  "required": true,        // 必填（NOT NULL）
  "unique": true,          // 唯一约束
  "default": "guest",      // 默认值
  "description": "用户邮箱" // 字段描述
}
```

### 主键和自增

```json
{
  "name": "id",
  "type": "integer",
  "primaryKey": true,      // 主键
  "autoIncrement": true    // 自增
}
```

或使用 UUID：

```json
{
  "name": "id",
  "type": "uuid",
  "primaryKey": true
}
```

### 字段长度

```json
{
  "name": "username",
  "type": "string",
  "length": 50             // varchar(50)
}
```

### 小数精度

```json
{
  "name": "price",
  "type": "decimal",
  "precision": 10,         // 总位数
  "scale": 2               // 小数位数 (DECIMAL(10,2))
}
```

### 外键引用

```json
{
  "name": "userId",
  "type": "integer",
  "reference": {
    "table": "users",           // 引用的表
    "field": "id",              // 引用的字段
    "onDelete": "cascade",      // 删除行为
    "onUpdate": "cascade"       // 更新行为
  }
}
```

**删除/更新行为**：
- `cascade` - 级联删除/更新
- `set null` - 设置为 NULL
- `restrict` - 限制（有引用时禁止删除）
- `no action` - 无操作

### 验证规则

```json
{
  "name": "age",
  "type": "integer",
  "validation": {
    "min": 18,              // 最小值
    "max": 120              // 最大值
  }
}
```

```json
{
  "name": "email",
  "type": "string",
  "validation": {
    "email": true           // 邮箱格式验证
  }
}
```

```json
{
  "name": "website",
  "type": "string",
  "validation": {
    "url": true             // URL 格式验证
  }
}
```

```json
{
  "name": "status",
  "type": "string",
  "validation": {
    "enum": ["active", "inactive", "pending"]  // 枚举值
  }
}
```

```json
{
  "name": "phone",
  "type": "string",
  "validation": {
    "pattern": "^1[3-9]\\d{9}$"  // 正则表达式
  }
}
```

## 🗂️ 索引定义

```json
{
  "indexes": [
    {
      "name": "idx_user_email",
      "fields": ["email"],
      "unique": true
    },
    {
      "name": "idx_article_author_category",
      "fields": ["authorId", "categoryId"]  // 复合索引
    }
  ]
}
```

## ⏰ 时间戳

默认会自动添加 `createdAt` 和 `updatedAt` 字段：

```json
{
  "timestamps": {
    "createdAt": true,
    "updatedAt": true
  }
}
```

禁用时间戳：

```json
{
  "timestamps": {
    "createdAt": false,
    "updatedAt": false
  }
}
```

## 🗑️ 软删除

启用软删除（添加 `deletedAt` 字段）：

```json
{
  "softDelete": true
}
```

## 🔌 API 配置

默认配置：

```json
{
  "api": {
    "list": { "enabled": true, "auth": false },
    "get": { "enabled": true, "auth": false },
    "create": { "enabled": true, "auth": true },
    "update": { "enabled": true, "auth": true },
    "delete": { "enabled": true, "auth": true }
  }
}
```

自定义配置：

```json
{
  "api": {
    "list": {
      "enabled": true,
      "auth": false
    },
    "create": {
      "enabled": true,
      "auth": true,
      "roles": ["admin", "editor"]  // 角色限制
    },
    "delete": {
      "enabled": false               // 禁用删除接口
    }
  }
}
```

## 🛠️ 生成配置

默认生成所有代码：

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

自定义生成：

```json
{
  "generate": {
    "schema": true,
    "repository": true,
    "service": false,    // 不生成 Service
    "route": false,      // 不生成 Route
    "validator": true
  }
}
```

## ✅ JSON Schema 验证

模型定义会自动验证：

### 验证规则

- ✅ **名称格式**：模型名必须是 PascalCase（如 `Product`）
- ✅ **字段名格式**：字段名必须是 camelCase（如 `userId`）
- ✅ **必填字段**：`name` 和 `fields` 是必填的
- ✅ **字段类型**：只能使用支持的类型
- ✅ **引用完整性**：外键引用必须指定 `table` 和 `field`
- ✅ **逻辑正确性**：如 `autoIncrement` 只能用于 `integer` 类型的主键

### 错误示例

```json
{
  "name": "product",  // ❌ 错误：应该是 PascalCase（Product）
  "fields": [
    {
      "name": "UserId",  // ❌ 错误：应该是 camelCase（userId）
      "type": "number"   // ❌ 错误：类型应该是 integer 而不是 number
    }
  ]
}
```

验证失败时会显示详细错误信息。

##  最佳实践

### 1. 使用描述字段

```json
{
  "name": "Product",
  "description": "商品管理",  // ✅ 添加模型描述
  "fields": [
    {
      "name": "price",
      "type": "decimal",
      "description": "商品价格（单位：元）"  // ✅ 添加字段描述
    }
  ]
}
```

### 2. 合理使用外键

```json
{
  "name": "productId",
  "type": "integer",
  "required": true,
  "reference": {
    "table": "products",
    "field": "id",
    "onDelete": "cascade"  // ✅ 明确删除行为
  }
}
```

### 3. 添加索引

```json
{
  "indexes": [
    {
      "name": "idx_order_user_status",
      "fields": ["userId", "status"]  // ✅ 常用查询添加索引
    }
  ]
}
```

### 4. 验证规则

```json
{
  "name": "email",
  "type": "string",
  "required": true,
  "unique": true,
  "validation": {
    "email": true  // ✅ 添加格式验证
  }
}
```

### 5. 只配置必要字段

```json
{
  "name": "Article",
  "fields": [ /* ... */ ]
  // ✅ timestamps、api、generate 使用默认值
}
```

## 🎉 总结

### 优势

- ✅ **简洁** - 只需配置必要字段
- ✅ **简洁** - 只需配置必要字段
- ✅ **安全** - JSON Schema 自动验证
- ✅ **智能** - 默认值自动应用
- ✅ **灵活** - 支持完整的配置选项

### 快速开发流程

1. 创建 `*.model.json` 文件
2. 填写 `name` 和 `fields`（最小配置）
3. 运行 `pnpm run generate:model <name>`
4. 完成！

**使用 JSON 模型进行快速开发！** 🚀
