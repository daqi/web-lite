# Web Lite

一个基于 **Drizzle ORM + Hono + Valibot + Plop** 的可运行示例。

这个架构以轻量化为目标，且具备现代 TypeScript 全栈最佳实践。

适合的使用场景包括：
- SaaS 或 BaaS 轻后端
- 个人项目 / 独立开发者
- Serverless API 服务
- 快速验证型 MVP
- 内部工具平台

## ✨ 特性

- 🚀 **Hono** - 轻量级 Web 框架
- 🗄️ **Drizzle ORM** - 类型安全的 PostgreSQL ORM
- ✅ **Valibot** - 轻量级请求校验
- 🔧 **Plop.js** - 自动化模块代码生成
- 🤖 **自动生成 Validator** - 从 Drizzle Schema 自动生成 Valibot 校验器

## 📦 安装

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件,设置 DATABASE_URL
```

## 🗃️ 数据库设置

### 方法 1: 使用 Docker Compose (推荐)

```bash
# 一键启动数据库并初始化
pnpm run setup

# 或者分步执行
pnpm run docker:up    # 启动 PostgreSQL
pnpm run db:push      # 创建表结构
```

### 方法 2: 使用现有 PostgreSQL

```bash
# 确保 PostgreSQL 正在运行
# 更新 .env 中的 DATABASE_URL

# 推送 schema 到数据库
pnpm run db:push

# 打开 Drizzle Studio (可视化数据库管理)
pnpm run db:studio
```

详细的 Docker 使用说明请查看 [docs/DOCKER.md](./docs/DOCKER.md)

## 🚀 运行

```bash
# 生成 Validators (从 Drizzle Schema)
pnpm run generate:validators

# 开发模式
pnpm run dev

# 生产模式
pnpm start
```

服务将运行在 `http://localhost:3000`

## 📝 API 端点

### 用户 (Users)

- `GET /user` - 获取所有用户
- `GET /user/:id` - 获取单个用户
- `POST /user` - 创建用户
  ```json
  {
    "name": "张三",
    "email": "zhangsan@example.com"
  }
  ```
- `PUT /user/:id` - 更新用户
- `DELETE /user/:id` - 删除用户

## 🔧 使用 Plop 生成新模块

```bash
pnpm plop module
```

按提示输入模块名称(例如: `product`, `order`),将自动生成:

```
src/modules/product/
├── product.repository.ts   # 数据访问层
├── product.service.ts      # 业务逻辑层
├── product.route.ts        # 路由层
└── index.ts                # 导出
```

### 生成模块后的步骤:

1. 在 `src/db/schema/` 中创建对应的数据表定义
2. 运行 `pnpm run generate:validators` 生成校验器
3. 在 `src/app.ts` 中注册路由

## 📁 项目结构

```
web-lite/
├── src/
│   ├── app.ts                 # Hono App 主入口
│   ├── index.ts               # 服务器启动
│   ├── db/
│   │   ├── client.ts          # Drizzle 客户端
│   │   └── schema/
│   │       ├── index.ts
│   │       └── user.ts       # 用户表定义
│   ├── modules/               # 业务模块
│   │   └── user/
│   │       ├── index.ts
│   │       ├── user.repository.ts
│   │       ├── user.service.ts
│   │       └── user.route.ts
│   └── validators/            # 自动生成的校验器
│       └── user.validator.ts
├── scripts/
│   └── generate-validators.ts # 校验器生成脚本
├── plop-templates/            # Plop 模板
│   ├── repository.hbs
│   ├── service.hbs
│   ├── route.hbs
│   └── index.hbs
├── plopfile.ts                # Plop 配置
├── package.json
└── tsconfig.json
```

## 🛠️ 技术栈

- **Runtime**: Node.js
- **Language**: TypeScript
- **Web Framework**: Hono
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Validation**: Valibot
- **Code Generator**: Plop.js

## 📚 开发流程

### 添加新功能模块

1. **创建数据表**
   ```bash
   # 在 src/db/schema/ 中创建新表定义
   # 例如: product.ts
   ```

2. **生成校验器**
   ```bash
   pnpm run generate:validators
   ```

3. **生成模块代码**
   ```bash
   pnpm plop module
   # 输入: product
   ```

4. **注册路由**
   ```typescript
   // src/app.ts
   import { productRoute } from './modules/product';
   app.route('/product', productRoute);
   ```

5. **推送数据库变更**
   ```bash
   pnpm run db:push
   ```

## 🎯 核心优势

1. **类型安全**: 从数据库到 API 的端到端类型安全
2. **自动化**: Schema → Validator 自动生成,减少手写代码
3. **模块化**: 清晰的分层架构 (Repository → Service → Route)
4. **快速开发**: Plop 模板快速生成标准化代码
5. **轻量高效**: Hono + Valibot 性能优异

## 📚 文档

详细文档请查看 [docs](./docs/) 目录:

- 📘 [快速开始指南](./docs/QUICKSTART.md)
- 🏗️ [架构设计](./docs/ARCHITECTURE.md)
- 🗄️ [数据库设计](./docs/DATABASE_SCHEMA.md)
- 🐳 [Docker 使用](./docs/DOCKER.md)
- 🤖 [Validator 自动生成](./docs/VALIDATOR_GENERATION.md)
- 📊 [项目总结](./docs/PROJECT_SUMMARY.md)

或访问 [文档中心](./docs/README.md) 查看完整索引。

## 📄 License

MIT
