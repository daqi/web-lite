# Vitest 集成测试文档

## 概述

本项目使用 Vitest 替代 bash 脚本进行集成测试,提供了更好的测试体验和可维护性。

## 安装

测试相关的依赖已经安装:

```bash
pnpm add -D vitest @vitest/ui supertest @types/supertest
```

## 配置

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config(); // 加载 .env 文件

export default defineConfig({
  test: {
    globals: true,  // 启用全局 API (describe, it, expect)
    environment: "node",  // Node.js 环境
    setupFiles: ["./tests/setup.ts"],  // 测试前执行的设置文件
    include: ["tests/**/*.test.ts"],  // 测试文件匹配模式
    coverage: {  // 代码覆盖率配置
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // 路径别名
    },
  },
});
```

## 测试脚本

在 `package.json` 中添加了以下测试命令:

- `pnpm test` - 运行所有测试
- `pnpm test:coverage` - 运行测试并生成覆盖率报告

## 测试文件结构

```
tests/
├── setup.ts                    # 全局测试设置(数据库清理等)
├── helpers.ts                  # 测试辅助函数
└── integration/
    ├── auth.test.ts           # Auth 模块集成测试
    └── api.test.ts            # API 集成测试(User/Product/Order)
```

## 测试设置 (tests/setup.ts)

在所有测试之前自动清理数据库:

```typescript
import { beforeAll } from "vitest";
import { db } from "../src/db/client";
import { user, product, order, authUsers, refreshTokens } from "../src/db/schema";

beforeAll(async () => {
  console.log("🧹 清理测试数据库...");

  // 删除所有测试数据
  await db.delete(refreshTokens);
  await db.delete(authUsers);
  await db.delete(order);
  await db.delete(product);
  await db.delete(user);

  console.log("✅ 数据库清理完成");
});
```

## 编写测试

### 使用 Hono 应用进行测试

由于项目使用 Hono 框架,测试时直接使用 Hono 的 `fetch` 方法:

```typescript
import { describe, it, expect } from "vitest";
import app from "../../src/app";

describe("API 测试", () => {
  it("应该返回用户列表", async () => {
    const response = await app.request("/user", {
      method: "GET",
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("应该创建新用户", async () => {
    const response = await app.request("/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alice",
        email: "alice@example.com",
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe("Alice");
  });
});
```

### 测试 JWT 认证

```typescript
it("应该访问受保护的路由", async () => {
  // 先登录获取 token
  const loginResponse = await app.request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "testuser",
      password: "password123",
    }),
  });

  const { accessToken } = await loginResponse.json();

  // 使用 token 访问受保护的路由
  const response = await app.request("/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  expect(response.status).toBe(200);
});
```


## 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 使用 UI 界面
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage
```

## 优势对比 Bash 脚本

| 特性 | Bash 脚本 | Vitest |
|------|----------|--------|
| 类型安全 | ❌ | ✓ TypeScript |
| 断言库 | ❌ 手动解析 | ✓ expect API |
| 测试隔离 | ❌ | ✓ 每个测试独立 |
| 并行执行 | ❌ | ✓ 自动并行 |
| 调试体验 | ❌ | ✓ VS Code集成 |
| CI/CD集成 | ✓ | ✓✓ 更好的报告 |
| 代码覆盖率 | ❌ | ✓ 内置支持 |
| 监听模式 | ❌ | ✓ |


## 参考资料

- [Vitest 官方文档](https://vitest.dev/)
- [Hono 测试文档](https://hono.dev/getting-started/testing)
- [项目测试文件](./tests/)
