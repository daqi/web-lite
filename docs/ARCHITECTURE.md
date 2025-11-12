# 🏗️ 项目架构说明

> ⚠️ **已废弃**：本文档基于 Plop 代码生成器的旧架构。  
> 📖 **最新文档**：请查看 [JSON_MODEL.md](./JSON_MODEL.md) 了解基于 JSON 模型驱动的新架构。

## 目录结构详解

```
web-lite/
├── docs/                          # 文档目录
│
├── src/                           # 源代码目录
│   ├── app.ts                    # Hono 应用主文件,路由注册和错误处理
│   ├── index.ts                  # 服务器入口,启动 HTTP 服务
│   │
│   ├── db/                       # 数据库相关
│   │   ├── client.ts            # Drizzle 客户端实例
│   │   └── schema/              # 数据表定义
│   │       ├── index.ts         # 导出所有 schema
│   │       └── user.ts         # 用户表定义
│   │
│   ├── modules/                  # 业务模块(按功能划分)
│   │   └── user/                # 用户模块
│   │       ├── index.ts         # 模块导出
│   │       ├── user.repository.ts  # 数据访问层
│   │       ├── user.service.ts     # 业务逻辑层
│   │       └── user.route.ts       # 路由控制层
│   │
│   └── validators/               # 自动生成的校验器
│       └── user.validator.ts   # 用户数据校验
│
├── scripts/                       # 工具脚本
│   └── generate-validators.ts    # 从 Drizzle schema 生成 Valibot 校验器
│
├── plop-templates/               # Plop 代码模板
│   ├── repository.hbs           # Repository 层模板
│   ├── service.hbs              # Service 层模板
│   ├── route.hbs                # Route 层模板
│   └── index.hbs                # 模块导出模板
│
├── plopfile.ts                   # Plop 配置文件
├── drizzle.config.ts            # Drizzle Kit 配置
├── tsconfig.json                # TypeScript 配置
├── package.json                 # 项目依赖和脚本
├── .env                         # 环境变量(不提交到 Git)
├── .env.example                 # 环境变量示例
├── .gitignore                   # Git 忽略文件
└── README.md                    # 项目说明文档
```

## 分层架构

本项目采用经典的三层架构模式:

```
┌─────────────────────────────────────────┐
│           HTTP Request                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Route Layer (路由层)             │
│  • 接收 HTTP 请求                          │
│  • 使用 Valibot 校验请求参数                │
│  • 调用 Service 层                        │
│  • 返回 HTTP 响应                         │
│  File: *.route.ts                       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Service Layer (业务逻辑层)          │
│  • 处理业务逻辑                            │
│  • 数据转换和验证                          │
│  • 调用 Repository 层                     │
│  • 错误处理                               │
│  File: *.service.ts                     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     Repository Layer (数据访问层)         │
│  • 封装数据库操作                          │
│  • CRUD 基础操作                          │
│  • 使用 Drizzle ORM                      │
│  • 不包含业务逻辑                          │
│  File: *.repository.ts                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Database (PostgreSQL)          │
└─────────────────────────────────────────┘
```

## 核心概念

### 1. Repository 层

**职责**: 纯粹的数据访问,不包含业务逻辑

```typescript
export class UserRepository {
  async findAll() {
    return await db.select().from(user);
  }

  async findById(id: number) {
    const result = await db.select().from(user).where(eq(user.id, id));
    return result[0] || null;
  }

  async create(data: CreateUserInput) {
    const result = await db.insert(user).values(data).returning();
    return result[0];
  }
}
```

**特点**:
- 只负责数据库 CRUD 操作
- 返回原始数据
- 可被多个 Service 复用

### 2. Service 层

**职责**: 业务逻辑处理

```typescript
export class UserService {
  private repository = new UserRepository();

  async get(id: number) {
    const user = await this.repository.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async create(data: CreateUserInput) {
    // 这里可以添加业务逻辑,如:
    // - 检查邮箱是否已存在
    // - 密码加密
    // - 发送欢迎邮件
    return await this.repository.create(data);
  }
}
```

**特点**:
- 包含业务规则和验证
- 可以调用多个 Repository
- 处理异常和错误

### 3. Route 层

**职责**: HTTP 请求处理

```typescript
const route = new Hono();

route.post('/', valibot('json', createUsersSchema), async (c) => {
  const body = c.req.valid('json');  // 已通过 Valibot 校验
  const user = await service.create(body);
  return c.json(user, 201);
});
```

**特点**:
- 使用 Valibot 自动校验请求
- 调用 Service 层方法
- 返回标准 HTTP 响应
- 不包含业务逻辑

## 数据流转

### 创建用户的完整流程:

```
1. HTTP Request
   POST /user
   Body: { "name": "张三", "email": "zhangsan@example.com" }

2. Route Layer (user.route.ts)
   ↓ valibot 校验请求体
   ↓ 校验通过
   ↓ 调用 service.create(body)

3. Service Layer (user.service.ts)
   ↓ 执行业务逻辑(如检查邮箱是否重复)
   ↓ 调用 repository.create(data)

4. Repository Layer (user.repository.ts)
   ↓ 使用 Drizzle ORM
   ↓ db.insert(user).values(data).returning()

5. Database
   ↓ 插入数据
   ↓ 返回插入的记录

6. 原路返回
   Repository → Service → Route → HTTP Response
```

## 类型安全流程

```typescript
// 1. 定义 Drizzle Schema
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
});

// 2. 自动生成 Valibot Schema (generate-validators.ts)
export const createUsersSchema = v.object({
  name: v.pipe(v.string(), v.maxLength(50)),
  email: v.pipe(v.string(), v.maxLength(100)),
});

// 3. 类型推导
export type CreateUsersInput = v.InferOutput<typeof createUsersSchema>;

// 4. 在代码中使用(完全类型安全)
async create(data: CreateUsersInput) {
  // data.name - ✅ 类型安全
  // data.email - ✅ 类型安全
  // data.age - ❌ 编译错误
}
```

## 自动化工作流

### 添加新模块的完整流程:

```bash
# 1. 创建数据表定义
# src/db/schema/product.ts

# 2. 导出 schema
# src/db/schema/index.ts

# 3. 自动生成 Validator
pnpm run generate:validators
# 生成 → src/validators/product.validator.ts

# 4. 使用 Plop 生成模块代码
pnpm plop module
# 输入: product
# 生成 → src/modules/product/*

# 5. 推送数据库变更
pnpm run db:push

# 6. 注册路由
# src/app.ts
```

## 配置文件说明

### package.json

定义项目依赖和脚本命令:
- `dev`: 开发模式(热重载)
- `start`: 生产模式
- `generate:validators`: 生成校验器
- `plop`: 代码生成器
- `db:push`: 推送数据库变更
- `db:studio`: 打开数据库可视化工具

### tsconfig.json

TypeScript 编译配置:
- `target: ES2022`: 编译目标
- `module: ESNext`: 模块系统
- `strict: true`: 严格模式
- `moduleResolution: bundler`: 模块解析策略

### drizzle.config.ts

Drizzle Kit 配置:
- `schema`: Schema 文件位置
- `out`: 迁移文件输出目录
- `dialect`: 数据库类型
- `dbCredentials`: 数据库连接信息

## 最佳实践

### 1. 单一职责原则
- Repository: 只负责数据访问
- Service: 只负责业务逻辑
- Route: 只负责 HTTP 处理

### 2. 依赖注入
```typescript
export class UserService {
  constructor(private repository = new UserRepository()) {}
}
```

### 3. 错误处理
```typescript
// Service 层抛出业务异常
if (!user) throw new Error('User not found');

// Route 层的全局错误处理器会捕获
app.onError((err, c) => {
  return c.json({ error: err.message }, 500);
});
```

### 4. 类型安全
- 所有函数都有明确的类型定义
- 使用 TypeScript 的类型推导
- 从 Schema 自动生成类型

## 扩展点

### 1. 添加认证中间件
```typescript
// src/middleware/auth.ts
export const authMiddleware = async (c, next) => {
  // 验证 JWT token
  await next();
};

// 使用
route.get('/', authMiddleware, async (c) => {...});
```

### 2. 添加日志
```typescript
// src/middleware/logger.ts
export const logger = async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
};

app.use('*', logger);
```

### 3. 添加 CORS
```typescript
import { cors } from 'hono/cors';

app.use('*', cors());
```

### 4. 添加数据库迁移
```bash
# 生成迁移文件
pnpm drizzle-kit generate

# 运行迁移
pnpm drizzle-kit migrate
```

## 性能优化建议

1. **数据库连接池**: 已配置(pg Pool)
2. **索引**: 在 Schema 中添加索引定义
3. **缓存**: 可集成 Redis
4. **分页**: 在 Repository 中实现
5. **查询优化**: 使用 Drizzle 的查询构建器

## 安全建议

1. **环境变量**: 敏感信息存储在 .env
2. **输入验证**: 使用 Valibot 严格验证
3. **SQL 注入防护**: Drizzle ORM 自动处理
4. **CORS 配置**: 生产环境限制来源
5. **速率限制**: 可添加中间件

## 总结

这个项目架构提供了:

✅ **清晰的分层** - 易于理解和维护  
✅ **类型安全** - 端到端类型检查  
✅ **自动化** - 减少重复劳动  
✅ **可扩展** - 容易添加新功能  
✅ **规范统一** - 所有模块遵循相同模式  

适合用于快速开发中小型 Web API 项目!
