# 约定式和配置式开发指南

## 📖 概述

Web Lite 支持两种开发模式：

- **约定式（Convention）**: 自动扫描和注册，零配置开发 ⭐ 推荐
- **配置式（Configuration）**: 手动控制和配置，更灵活

## 🎯 约定式开发（推荐）

### 核心理念

遵循约定优于配置（Convention over Configuration）的原则，通过文件命名和目录结构自动完成注册。

### 文件命名约定

```
src/models/
├── *.model.json      # JSON 模型定义文件（自动加载）
└── index.ts          # 模型注册中心

src/modules/
└── <module-name>/    # 模块目录（自动扫描）
    ├── <module-name>.repository.ts
    ├── <module-name>.service.ts
    ├── <module-name>.route.ts   # 自动注册路由
    └── index.ts

src/db/schema/
├── *.ts              # Schema 文件（自动导出）
└── index.ts          # 自动生成的导出文件
```

### 使用步骤

#### 1. 创建模型定义

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
    },
    {
      "name": "authorId",
      "type": "integer",
      "required": true,
      "reference": {
        "table": "users",
        "field": "id"
      }
    },
    {
      "name": "isPublished",
      "type": "boolean",
      "default": false
    }
  ]
}
```

**约定**：
- 文件名必须是 `*.model.json` 格式
- JSON 格式定义，自动验证和应用默认值

#### 2. 生成代码

```bash
pnpm run generate:model article
```

**自动完成**：
- ✅ 生成 Schema、Validator、Repository、Service、Route
- ✅ 自动注册到 `src/db/schema/index.ts`
- ✅ 自动注册到 `src/app.ts`

#### 3. 更新数据库

```bash
pnpm run db:push
```

完成！无需任何手动配置。

### 模型自动加载

JSON 模型会被自动扫描和加载：

```typescript
// src/models/index.ts 中自动加载
import { loadModelsSync } from './loader';
const autoLoadedModels = loadModelsSync();
```

**支持的格式**：
- `product.model.json` → 自动加载
- `category.model.json` → 自动加载
- `user-profile.model.json` → 自动加载

### 路由自动注册

生成的路由会自动注册到 `src/router.ts`：

```typescript
// src/router.ts (自动生成和维护)
// ========== AUTO-REGISTER START ==========
import { articleRoute } from './modules/article';
import { productRoute } from './modules/product';

router.route('/article', articleRoute);
router.route('/product', productRoute);
// ========== AUTO-REGISTER END ==========
```

然后在 `src/app.ts` 中统一引入：

```typescript
// src/app.ts
import router from './router';

app.route('/', router);  // 挂载所有自动生成的路由
```

**路由路径约定**：
- 模块名 `article` → 路由 `/article`
- 模块名 `user-profile` → 路由 `/user_profile`

### Schema 自动导出

所有 schema 文件自动导出：

```typescript
// src/db/schema/index.ts (自动生成)
export * from './article';
export * from './product';
export * from './category';
```

## ⚙️ 配置式开发

### 使用场景

- 需要精确控制加载顺序
- 只想加载部分模型
- 需要自定义路由路径
- 多环境不同配置

### 模型手动注册

在 `src/models/index.ts` 中手动配置：

```typescript
// 手动导入 JSON 模型
import productModel from './product.model.json';
import categoryModel from './category.model.json';

// 手动配置的模型（优先级更高）
export const configuredModels = {
  product: productModel,
  category: categoryModel,
  // 只加载这些
};
```

### 路由手动注册

**方式一：在 router.ts 的 AUTO-REGISTER 区域外**

```typescript
// src/router.ts
import { Hono } from 'hono';
import { articleRoute } from './modules/article';

const router = new Hono();

// 手动注册（自定义路径）
router.route('/api/articles', articleRoute);

// ========== AUTO-REGISTER START ==========
// 自动注册的路由
// ========== AUTO-REGISTER END ==========

export default router;
```

**方式二：在 app.ts 中独立注册**

```typescript
// src/app.ts
import { Hono } from 'hono';
import router from './router';
import { specialRoute } from './modules/special';

const app = new Hono();

// 手动注册特殊路由（不通过 router.ts）
app.route('/special', specialRoute);

// 注册自动生成的路由
app.route('/', router);
```

### Schema 手动导出

如果不想使用自动生成的 `schema/index.ts`：

```typescript
### Schema 手动导出

如果不想使用自动生成的 `schema/index.ts`：

```typescript
// src/db/schema/index.ts
export * from './user';
export * from './auth';
// 不导出其他 schema
```
```

## 🔄 混合模式

两种模式可以混合使用：

```typescript
// src/models/index.ts

// 约定式：自动加载
const autoLoadedModels = loadModelsSync();

// 配置式：手动注册（优先级更高）
const configuredModels = {
  product: productModel,  // 覆盖自动加载的 product
};

// 合并
export const models = {
  ...autoLoadedModels,
  ...configuredModels,  // 配置式优先
};
```

**优先级**：配置式 > 约定式

## 📊 对比

| 特性 | 约定式 | 配置式 |
|------|--------|--------|
| 学习成本 | 低 | 中 |
| 开发速度 | 快 | 中 |
| 灵活性 | 中 | 高 |
| 维护成本 | 低 | 高 |
| 适用场景 | 标准功能 | 特殊需求 |

## 🎯 最佳实践

### 推荐：约定式为主

```typescript
// 1. 创建模型
// src/models/article.model.ts
export const articleModel: ModelDefinition = { ... };

// 2. 生成代码（自动注册）
// pnpm run generate:model article

// 3. 完成！
```

### 特殊情况：配置式

```typescript
// 只在以下情况使用配置式：

// 1. 需要自定义路由路径
app.route('/api/v1/articles', articleRoute);

// 2. 条件加载
const models = process.env.NODE_ENV === 'production'
  ? { product: productModel }
  : { product: productModel, test: testModel };

// 3. 加载顺序重要
export const models = {
  user: userModel,      // 必须先加载
  article: articleModel,
};
```

## 🔧 配置选项

### 禁用自动加载

如果你想完全使用配置式：

```typescript
// src/models/index.ts

// 不使用自动加载
// const autoLoadedModels = loadModelsSync();

// 只使用手动配置
export const models = {
  product: productModel,
  category: categoryModel,
};
```

### 禁用自动注册

**方式一：不使用 router.ts**

```typescript
// src/app.ts

// 不导入 router
// import router from './router';

// 手动注册所有路由
import { authRoute } from './modules/auth';
import { userRoute } from './modules/user';

app.route('/auth', authRoute);
app.route('/user', userRoute);
```

**方式二：清空 router.ts 的 AUTO-REGISTER 区域**

手动编辑 `src/router.ts`，删除 AUTO-REGISTER 区域的内容，仅保留自己需要的路由。

### 自定义路由路径

**方式一：在 router.ts 中自定义**

```typescript
// src/router.ts

// 在 AUTO-REGISTER 之前自定义路径
import { productRoute } from './modules/product';
router.route('/api/v2/products', productRoute);

// ========== AUTO-REGISTER START ==========
// 自动注册的其他路由（使用默认路径）
// ========== AUTO-REGISTER END ==========
```

**方式二：在 app.ts 中自定义**

```typescript
// src/app.ts
import { productRoute } from './modules/product';

// 独立注册，使用自定义路径
app.route('/api/v2/products', productRoute);

// 注册其他自动生成的路由
app.route('/', router);
```

## 📝 FAQ

### Q: 约定式和配置式可以混用吗？
A: 可以！配置式的优先级更高，会覆盖约定式。

### Q: 如何排除某个自动加载的模型？
A: 在配置式中显式设置为 `undefined` 或重新定义。

### Q: 自动注册会覆盖手动注册吗？
A: 不会。AUTO-REGISTER 区域是独立的，不影响区域外的代码。

### Q: 可以自定义自动注册的路由路径吗？
A: 目前不支持，建议使用手动注册来自定义路径。

### Q: 如何知道哪些模型被加载了？
A: 运行 `pnpm run generate:model` 不带参数，会显示所有可用模型。

## 🎉 总结

- ✅ **新项目**：使用约定式，快速开发
- ✅ **标准功能**：使用约定式，零配置
- ✅ **特殊需求**：使用配置式，精确控制
- ✅ **灵活切换**：两种模式可混用

**推荐使用约定式开发，享受自动化带来的效率提升！** 🚀
