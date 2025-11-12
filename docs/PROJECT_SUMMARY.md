# 📦 Web Lite 项目总结

一个基于 **JSON 模型驱动开发**的轻量级 Web 后端框架。

## ✨ 核心特性

✅ **JSON 模型驱动** - 通过 JSON 配置自动生成全部代码
✅ **类型安全** - 端到端 TypeScript 类型检查
✅ **智能验证** - 支持 regex、email、url、enum 等验证规则
✅ **自动注册** - Schema 和路由自动注册，零配置
✅ **分层架构** - Repository → Service → Route
✅ **高性能** - Hono + Drizzle ORM
✅ **开发效率** - 5 分钟完成一个完整 CRUD 模块

---

## 📁 项目结构

```
web-lite/
├── src/
│   ├── app.ts                 # Hono 应用主入口
│   ├── index.ts               # 服务器启动
│   ├── router.ts              # 路由自动注册
│   ├── db/
│   │   ├── client.ts          # Drizzle 客户端
│   │   └── schema/            # 数据库 Schema
│   │       ├── index.ts       # Schema 自动注册
│   │       ├── user.ts
│   │       ├── product.ts
│   │       ├── category.ts
│   │       └── order.ts
│   ├── models/                # JSON 模型定义 ⭐
│   │   ├── types.ts           # TypeScript 类型
│   │   ├── schema.json        # JSON Schema 验证
│   │   ├── validator.ts       # 模型验证器
│   │   ├── loader.ts          # 模型加载器
│   │   ├── index.ts           # 模型注册中心
│   │   ├── user.model.json    # 用户模型
│   │   ├── product.model.json # 商品模型
│   │   ├── category.model.json # 分类模型
│   │   └── order.model.json   # 订单模型
│   ├── modules/               # 业务模块
│   │   ├── user/              # 用户模块
│   │   ├── product/           # 商品模块
│   │   ├── category/          # 分类模块
│   │   └── order/             # 订单模块
│   └── validators/            # Valibot 校验器
│       ├── user.validator.ts
│       ├── product.validator.ts
│       ├── category.validator.ts
│       └── order.validator.ts
├── scripts/
│   ├── model-generator.ts        # 模型代码生成器核心
│   ├── generate-from-model.ts    # CLI 工具
│   └── route-register.ts         # 路由自动注册
├── docs/                      # 完整文档
│   ├── JSON_MODEL.md                 # 完整 JSON 模型指南
│   ├── JSON_MODEL_QUICKSTART.md      # 5 分钟快速开始
│   ├── JSON_MODEL_FIELD_CONFIG.md    # 字段配置完整指南
│   ├── CONVENTION_AND_CONFIGURATION.md # 约定式开发
│   ├── ROUTER.md                     # 路由管理
│   └── README.md                     # 文档中心
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

---

## 🚀 快速开始

#### 1️⃣ 安装依赖
```bash
pnpm install
```

#### 2️⃣ 启动数据库
```bash
# 使用 Docker Compose（推荐）
pnpm run setup

# 或者使用现有 PostgreSQL
# 确保 .env 中的 DATABASE_URL 正确配置
```

#### 3️⃣ 启动服务
```bash
pnpm run dev
```

服务将在 `http://localhost:3000` 启动

#### 4️⃣ 测试 API
```bash
# 获取所有用户
curl http://localhost:3000/user

# 创建用户
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "role": "user"
  }'
```

---

## 🎯 创建新模块（3 步完成）

#### 步骤 1: 创建 JSON 模型

在 `src/models/` 下创建 `article.model.json`：

```json
{
  "name": "Article",
  "description": "博客文章",
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
      "length": 200,
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
      "name": "status",
      "type": "string",
      "length": 20,
      "default": "draft",
      "validation": {
        "enum": ["draft", "published", "archived"]
      }
    }
  ]
}
```

#### 步骤 2: 生成代码

```bash
pnpm run generate:model article
```

**自动生成**：
- ✅ `src/db/schema/article.ts` - Drizzle Schema
- ✅ `src/validators/article.validator.ts` - Valibot Validator
- ✅ `src/modules/article/article.repository.ts` - Repository
- ✅ `src/modules/article/article.service.ts` - Service
- ✅ `src/modules/article/article.route.ts` - Route
- ✅ `src/modules/article/index.ts` - 模块导出
- ✅ 自动注册到 `schema/index.ts`
- ✅ 自动注册到 `router.ts`

#### 步骤 3: 更新数据库

```bash
pnpm run db:push
```

**完成！** 现在你可以访问：
- `GET /article` - 获取所有文章
- `GET /article/:id` - 获取单个文章
- `POST /article` - 创建文章
- `PUT /article/:id` - 更新文章
- `DELETE /article/:id` - 删除文章

---

### 🛠️ 可用命令

```bash
# 开发
pnpm run dev                    # 开发模式（热重载）
pnpm start                      # 生产模式

# 模型生成
pnpm run generate:model <name>  # 生成完整模块

# 数据库
pnpm run db:push                # 推送数据库变更
pnpm run db:studio              # 打开数据库可视化工具

# Docker
pnpm run docker:up              # 启动 PostgreSQL
pnpm run docker:down            # 停止 PostgreSQL
pnpm run docker:logs            # 查看日志
pnpm run setup                  # 一键启动并初始化

# 测试
pnpm run test                   # 运行测试
pnpm run test:coverage          # 测试覆盖率
```

---

## 📖 支持的字段类型和验证

#### 字段类型
- `string` - 字符串（varchar）
- `text` - 长文本
- `integer` - 整数
- `decimal` - 小数
- `boolean` - 布尔值
- `timestamp` - 时间戳
- `json` - JSON 对象
- `uuid` - UUID
- `email` - 邮箱

#### 验证规则
- `length` - 字段长度（varchar(n)）
- `precision` & `scale` - 小数精度
- `min` & `max` - 最小/最大值或长度
- `regex` - 正则表达式验证
- `email` - 邮箱格式验证
- `url` - URL 格式验证
- `enum` - 枚举值限制

#### 示例

```json
{
  "name": "username",
  "type": "string",
  "length": 50,
  "validation": {
    "regex": "^[a-zA-Z0-9_]{3,20}$"
  }
}
```

```json
{
  "name": "email",
  "type": "string",
  "validation": {
    "email": true
  }
}
```

```json
{
  "name": "status",
  "type": "string",
  "validation": {
    "enum": ["active", "inactive", "pending"]
  }
}
```

```json
{
  "name": "price",
  "type": "decimal",
  "precision": 10,
  "scale": 2
}
```

---

## 🎨 核心优势

#### 1. 开发效率提升 15 倍

**传统方式**：
- 手写 Schema、Validator、Repository、Service、Route
- 手动注册路由和 Schema
- ~300 行代码，30-60 分钟

**JSON 模型方式**：
- 编写 JSON 配置
- 一键生成全部代码
- ~20 行配置，5 分钟

#### 2. 类型安全

从数据库到 API 的端到端类型安全：
```
JSON 模型 → Drizzle Schema → TypeScript 类型 → Valibot Validator → API
```

#### 3. 智能默认值

自动应用最佳实践：
- 自动添加 `createdAt`、`updatedAt` 时间戳
- 自动配置 API 端点（list、get、create、update、delete）
- 自动生成代码（schema、validator、repository、service、route）
- 自动注册 Schema 和路由

#### 4. 灵活配置

支持约定式和配置式两种加载方式：

```typescript
// 约定式：自动加载所有模型
const models = loadModelsSync();

// 配置式：只加载指定模型
const models = loadModelsSync({
  article: true,
  product: true,
});
```

---

## 📚 完整文档

详细文档请查看 [docs](../docs/) 目录：

- 📖 [JSON 模型快速开始](./JSON_MODEL_QUICKSTART.md) - 5 分钟上手
- 📖 [完整 JSON 模型指南](./JSON_MODEL.md) - 详细配置说明
- 📖 [字段配置指南](./JSON_MODEL_FIELD_CONFIG.md) - 所有字段选项
- ✨ [约定式开发](./CONVENTION_AND_CONFIGURATION.md) - 零配置开发
- 🔀 [路由管理](./ROUTER.md) - 路由系统说明
- 📚 [文档中心](./README.md) - 所有文档索引

---

## 💡 最佳实践

1. **模型命名**：使用 PascalCase（如 `Product`、`OrderItem`）
2. **字段验证**：优先使用 `enum` > `regex` > `min/max`
3. **小数字段**：明确指定 `precision` 和 `scale`
4. **字符串长度**：根据实际需求设置 `length`，避免使用默认的 255
5. **外键关系**：使用 `reference` 定义表关系
6. **软删除**：需要时启用 `softDelete: true`

---

## 🔧 技术栈

- **Runtime**: Node.js
- **Language**: TypeScript
- **Web Framework**: Hono
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Validation**: Valibot
- **Schema Validation**: Ajv + JSON Schema
- **Code Generator**: 自研模型驱动生成器

---

## 🎉 开始使用

现在你已经了解了 Web Lite 的核心特性，可以开始开发了！

推荐阅读顺序：
1. [JSON 模型快速开始](./JSON_MODEL_QUICKSTART.md) - 快速上手
2. [完整 JSON 模型指南](./JSON_MODEL.md) - 深入学习
3. [字段配置指南](./JSON_MODEL_FIELD_CONFIG.md) - 配置参考

如有问题，欢迎查阅文档或提交 Issue。🚀

