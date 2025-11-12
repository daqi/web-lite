# 🎯 JSON 模型驱动开发系统

## 概述

这个系统允许你通过定义 **JSON 格式**的模型文件，自动生成完整的功能模块，包括：

- ✅ **Drizzle Schema** (数据库表定义)
- ✅ **Valibot Validator** (请求数据验证)
- ✅ **Repository** (数据访问层)
- ✅ **Service** (业务逻辑层)
- ✅ **Route** (API 路由层)

## 📁 目录结构

```
src/models/
├── types.ts                  # TypeScript 类型定义
├── schema.json               # JSON Schema 验证规则
├── validator.ts              # 模型验证器
├── loader.ts                 # 模型加载器
├── index.ts                  # 模型注册中心
├── product.model.json        # ✨ Product 模型（JSON 格式）
└── category.model.json       # ✨ Category 模型（JSON 格式）

scripts/
├── model-generator.ts        # 代码生成器核心逻辑
└── generate-from-model.ts    # CLI 工具
```

## 🚀 使用方式

### 方式一：约定式（推荐）

自动加载所有 `*.model.json` 文件：

```typescript
// src/models/index.ts
export const models = loadModelsSync();
// 自动加载: category, product 等所有模型
```

### 方式二：配置式

选择性加载指定模型：

```typescript
// src/models/index.ts
export const models = loadModelsSync({
  category: true,
  product: true,
  // 只加载这里列出的模型
});
```

配置式的优势：
- ✅ 简洁：只需 `{模型名: true}`
- ✅ 性能：只加载需要的模型
- ✅ 控制：明确知道加载了哪些模型

## 📄 示例模型

查看示例模型定义:
- `src/models/product.model.json` - 完整的商品模型示例
- `src/models/category.model.json` - 简单的分类模型示例
- `src/models/order.model.json` - 订单模型（包含枚举和自定义长度）

### 支持的特性

✅ **字段长度**：`"length": 50` → `varchar(50)`
✅ **枚举验证**：`"validation": { "enum": [...] }` → `v.picklist([...])`
✅ **小数精度**：`"precision": 10, "scale": 2` → `decimal(10,2)`
✅ **自动验证**：根据字段配置自动生成对应的 Valibot 验证规则

## 📖 完整文档

详细文档请查看:
- [JSON_MODEL.md](../../docs/JSON_MODEL.md) - 完整指南
- [JSON_MODEL_QUICKSTART.md](../../docs/JSON_MODEL_QUICKSTART.md) - 快速开始

## 🎮 命令

```bash
# 生成模型代码
pnpm run generate:model <modelName>

# 示例
pnpm run generate:model product
pnpm run generate:model category
```

## 💡 提示

1. 只需创建 `*.model.json` 文件
2. 运行生成命令，自动注册到 schema/index.ts 和 router.ts
3. 最后运行 `pnpm run db:push` 更新数据库

## 🎯 效率对比

### 传统方式
- 手写 5 个文件
- ~300 行代码
- 耗时 30-60 分钟

### JSON 模型方式
- 1 个 JSON 文件
- ~20 行配置（自动应用默认值）
- 耗时 5 分钟

**效率提升 15 倍！** 🚀
