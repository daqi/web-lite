# Router 入口说明

## 📖 概述

`src/router.ts` 是自动生成的路由注册入口，用于集中管理所有模型驱动生成的路由。

## 🎯 设计理念

### 为什么需要 router.ts？

**问题**：
- 在 app.ts 中直接注册路由会导致文件臃肿
- AUTO-REGISTER 区域与核心应用逻辑混在一起
- 难以区分手动路由和自动生成的路由

**解决方案**：
- 将所有自动生成的路由集中到 `router.ts`
- app.ts 保持简洁，只关注核心配置
- 清晰的职责分离

## 📁 文件结构

```
src/
├── app.ts        # 主应用入口（简洁）
├── router.ts     # 自动生成的路由入口
└── modules/
    ├── auth/
    │   └── auth.route.ts
    ├── product/
    │   └── product.route.ts
    └── user/
        └── user.route.ts
```

## 📝 文件内容

### router.ts

```typescript
/**
 * 路由注册入口
 *
 * 此文件由代码生成器自动维护
 * 请勿手动修改 AUTO-REGISTER 区域
 */

import { Hono } from 'hono';

const router = new Hono();

// ========== AUTO-REGISTER START ==========
import { authRoute } from './modules/auth';
import { productRoute } from './modules/product';
import { userRoute } from './modules/user';

// 注册路由
router.route('/auth', authRoute);
router.route('/product', productRoute);
router.route('/user', userRoute);
// ========== AUTO-REGISTER END ==========

export default router;
```

### app.ts

```typescript
import { Hono } from 'hono';
import router from './router';

const app = new Hono();

// 健康检查
app.get('/', (c) => {
  return c.json({
    message: 'Web Lite API',
    version: '1.0.0',
    status: 'running',
  });
});

// 注册自动生成的路由
app.route('/', router);

export default app;
```

## 🔄 自动更新流程

当你运行 `pnpm run generate:model <name>` 时：

1. **生成代码**：创建 Repository、Service、Route 等文件
2. **扫描路由**：自动扫描 `src/modules/*/*.route.ts`
3. **更新 router.ts**：在 AUTO-REGISTER 区域添加导入和注册代码
4. **保持 app.ts 不变**：app.ts 保持简洁

## ✨ 核心优势

### 1. 职责清晰

```
app.ts
├── 核心应用配置
├── 中间件
├── 错误处理
└── 挂载 router

router.ts
├── 自动生成的路由导入
└── 自动生成的路由注册
```

### 2. 易于维护

- **自动化**：路由由生成器自动管理
- **独立性**：修改 app.ts 不影响自动生成的路由
- **可追踪**：所有自动路由在一个文件中

### 3. 灵活扩展

**自动路由 vs 手动路由**：

```typescript
// src/app.ts - 手动注册特殊路由
import { adminRoute } from './modules/admin';
app.route('/admin', adminRoute);  // 手动路由

// 自动生成的路由
app.route('/', router);  // 来自 router.ts

// src/router.ts - 也可以混合
import { Hono } from 'hono';
const router = new Hono();

// 手动添加的路由（在 AUTO-REGISTER 之外）
router.get('/health', (c) => c.json({ ok: true }));

// ========== AUTO-REGISTER START ==========
// 自动生成的路由
// ========== AUTO-REGISTER END ==========
```

## 🎯 使用场景

### 场景 1：标准模块（自动）

```bash
# 创建模型
pnpm run generate:model product

# ✅ 自动注册到 router.ts
# ✅ app.ts 保持不变
```

### 场景 2：自定义路由（手动）

```typescript
// src/router.ts

// 自定义路由（在 AUTO-REGISTER 之前）
router.get('/custom', async (c) => {
  return c.json({ message: 'Custom route' });
});

// ========== AUTO-REGISTER START ==========
// 自动生成的路由
// ========== AUTO-REGISTER END ==========
```

### 场景 3：API 版本控制

```typescript
// src/app.ts

import router from './router';
import routerV2 from './router.v2';

// V1 API
app.route('/api/v1', router);

// V2 API
app.route('/api/v2', routerV2);
```

## 🔧 高级用法

### 1. 路由前缀

```typescript
// src/app.ts

// 为所有自动生成的路由添加前缀
app.route('/api', router);

// 结果：
// /api/auth
// /api/product
// /api/user
```

### 2. 中间件应用

```typescript
// src/router.ts

import { Hono } from 'hono';
import { logger } from './middlewares/logger';

const router = new Hono();

// 为所有自动生成的路由添加日志中间件
router.use('*', logger);

// ========== AUTO-REGISTER START ==========
// 自动生成的路由都会经过 logger
// ========== AUTO-REGISTER END ==========
```

### 3. 条件加载

```typescript
// src/app.ts

import router from './router';
import devRouter from './router.dev';

const app = new Hono();

// 生产环境
if (process.env.NODE_ENV === 'production') {
  app.route('/', router);
} else {
  // 开发环境加载额外的调试路由
  app.route('/', router);
  app.route('/debug', devRouter);
}
```

## 📝 最佳实践

### ✅ 推荐

```typescript
// 1. 使用 router.ts 管理自动生成的路由
import router from './router';
app.route('/', router);

// 2. 手动路由在 app.ts 中独立注册
app.route('/admin', adminRoute);

// 3. 不要手动修改 AUTO-REGISTER 区域
// ========== AUTO-REGISTER START ==========
// 让代码生成器维护这部分
// ========== AUTO-REGISTER END ==========
```

### ❌ 避免

```typescript
// 不要在 AUTO-REGISTER 区域内手动添加代码
// ========== AUTO-REGISTER START ==========
router.route('/product', productRoute);
router.route('/custom', customRoute);  // ❌ 会被覆盖
// ========== AUTO-REGISTER END ==========

// 不要删除 AUTO-REGISTER 标记
// ❌ 这会导致下次生成时无法找到插入位置
```

## 🎉 总结

`router.ts` 的核心价值：

1. **简化 app.ts**：让主应用文件保持简洁
2. **自动化管理**：路由自动注册，无需手动维护
3. **职责分离**：自动路由和手动路由清晰分离
4. **易于扩展**：支持中间件、前缀、版本控制等高级用法

**使用 router.ts，让路由管理更简单、更清晰！** 🚀
