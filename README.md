# Web Lite

一个基于 **Drizzle ORM + Hono + Valibot + JSON 模型驱动开发**的可运行示例。

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
- 🎯 **JSON 模型驱动开发** - 通过 JSON 配置自动生成完整模块代码
- 🤖 **智能默认值** - 自动应用最佳实践配置
- ✨ **约定式开发** - 自动扫描模型文件，自动注册路由，零配置开发
- 🔧 **配置式加载** - 灵活选择加载特定模型

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
# 开发模式
pnpm run dev

# 生产模式
pnpm start
```

服务将运行在 `http://localhost:3000`

## 🎯 快速生成新模块

使用 JSON 模型驱动开发，只需创建一个 JSON 文件即可生成完整模块！

### 1. 创建模型文件

在 `src/models/` 下创建 `product.model.json`：

```json
{
  "name": "Product",
  "description": "商品管理",
  "fields": [
    {
      "name": "id",
      "type": "integer",
      "primaryKey": true,
      "autoIncrement": true
    },
    {
      "name": "name",
      "type": "string",
      "required": true,
      "validation": {
        "min": 1,
        "max": 200
      }
    },
    {
      "name": "price",
      "type": "decimal",
      "precision": 10,
      "scale": 2,
      "required": true
    }
  ]
}
```

### 2. 生成代码

```bash
pnpm run generate:model product
```

### 3. 更新数据库

```bash
pnpm run db:push
```

**就这么简单！** 自动生成：
- ✅ Drizzle Schema (src/db/schema/product.ts)
- ✅ Valibot Validator (src/validators/product.validator.ts)
- ✅ Repository (src/modules/product/product.repository.ts)
- ✅ Service (src/modules/product/product.service.ts)
- ✅ Route (src/modules/product/product.route.ts)
- ✅ 自动注册到 schema/index.ts 和 router.ts

详细文档：
- 📖 [JSON 模型快速开始](./docs/JSON_MODEL_QUICKSTART.md)
- 📖 [完整 JSON 模型指南](./docs/JSON_MODEL.md)
- 📖 [字段配置指南](./docs/JSON_MODEL_FIELD_CONFIG.md)

## 📝 API 端点

### 用户 (Users)

- `GET /users` - 获取所有用户
- `GET /users/:id` - 获取单个用户
- `POST /users` - 创建用户
  ```json
  {
    "username": "zhangsan",
    "email": "zhangsan@example.com"
  }
  ```
- `PUT /users/:id` - 更新用户
- `DELETE /users/:id` - 删除用户

> 📌 **注意**：API 路径遵循 RESTful 规范，使用复数名词（如 `/users` 而非 `/user`）

## 📁 项目结构

```
web-lite/
├── src/
│   ├── app.ts                 # Hono App 主入口
│   ├── index.ts               # 服务器启动
│   ├── router.ts              # 路由自动注册
│   ├── db/
│   │   ├── client.ts          # Drizzle 客户端
│   │   └── schema/            # 数据库 Schema
│   │       ├── index.ts       # Schema 自动注册
│   │       ├── user.ts
│   │       ├── product.ts
│   │       └── order.ts
│   ├── models/                # JSON 模型定义
│   │   ├── types.ts           # TypeScript 类型
│   │   ├── schema.json        # JSON Schema 验证
│   │   ├── validator.ts       # 模型验证器
│   │   ├── loader.ts          # 模型加载器
│   │   ├── index.ts           # 模型注册中心
│   │   ├── user.model.json    # 用户模型
│   │   ├── product.model.json # 商品模型
│   │   └── order.model.json   # 订单模型
│   ├── modules/               # 业务模块
│   │   ├── user/
│   │   │   ├── index.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.route.ts
│   │   ├── product/
│   │   └── order/
│   └── validators/            # Valibot 校验器
│       ├── user.validator.ts
│       ├── product.validator.ts
│       └── order.validator.ts
├── scripts/
│   ├── model-generator.ts        # 模型代码生成器
│   ├── generate-from-model.ts    # CLI 工具
│   └── route-register.ts         # 路由自动注册
├── docs/                      # 完整文档
│   ├── JSON_MODEL.md
│   ├── JSON_MODEL_QUICKSTART.md
│   └── JSON_MODEL_FIELD_CONFIG.md
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
- **Schema Validation**: Ajv + JSON Schema
- **Code Generator**: 自研模型驱动生成器

## 📚 开发流程

### JSON 模型驱动开发（推荐）⭐

1. **创建 JSON 模型定义**
   ```bash
   # 在 src/models/ 中创建 JSON 模型
   # 例如: article.model.json
   ```

2. **生成完整模块**
   ```bash
   pnpm run generate:model article
   # 自动生成 Schema、Validator、Repository、Service、Route
   # 自动注册到 schema/index.ts 和 router.ts
   ```

3. **更新数据库**
   ```bash
   pnpm run db:push
   ```

详细文档: [JSON 模型定义指南](./docs/JSON_MODEL.md)

## 🎯 核心优势

1. **类型安全**: 从数据库到 API 的端到端类型安全
2. **模型驱动**: 定义一次 JSON 模型，自动生成全部代码
3. **自动化**: 自动应用默认值、自动注册路由、自动验证
4. **模块化**: 清晰的分层架构 (Repository → Service → Route)
5. **高效开发**: 5 分钟完成一个完整 CRUD 模块
6. **轻量高效**: Hono + Valibot 性能优异
7. **智能验证**: 支持 regex、email、url、enum 等多种验证

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
