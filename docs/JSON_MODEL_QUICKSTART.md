# JSON 模型快速开始

## 🚀 5 分钟创建一个完整的 CRUD 模块

### 步骤 1：创建 JSON 模型文件

在 `src/models/` 目录下创建 `article.model.json`：

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

**就这么简单！** 无需配置 `timestamps`、`api`、`generate` 等，系统会自动应用默认值。

### 步骤 2：生成代码

```bash
pnpm run generate:model article
```

输出：

```
🚀 开始生成 Article 模型的代码...

✅ Schema: src/db/schema/article.ts
✅ Validator: src/validators/article.validator.ts
✅ Repository: src/modules/article/article.repository.ts
✅ Service: src/modules/article/article.service.ts
✅ Route: src/modules/article/article.route.ts
✅ Index: src/modules/article/index.ts

✨ Article 模型代码生成完成!

✅ 已更新 schema/index.ts
✅ 已更新 router.ts 路由注册

✅ 全部完成！
```

### 步骤 3：更新数据库

```bash
pnpm run db:push
```

### 步骤 4：启动服务器

```bash
pnpm run dev
```

### 完成！

现在你已经有了完整的文章 CRUD API：

- `GET /article` - 获取文章列表
- `GET /article/:id` - 获取单个文章
- `POST /article` - 创建文章（需要认证）
- `PUT /article/:id` - 更新文章（需要认证）
- `DELETE /article/:id` - 删除文章（需要认证）

## 📊 生成的代码

### 1. Drizzle Schema

```typescript
// src/db/schema/article.ts
export const article = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 2. Valibot Validator

```typescript
// src/validators/article.validator.ts
export const createArticleSchema = object({
  title: pipe(string(), minLength(1), maxLength(200)),
  content: string(),
  authorId: number(),
  isPublished: optional(boolean()),
});
```

### 3. Repository

```typescript
// src/modules/article/article.repository.ts
export class ArticleRepository {
  async findAll() { /* ... */ }
  async findById(id: number) { /* ... */ }
  async create(data: CreateArticleData) { /* ... */ }
  async update(id: number, data: UpdateArticleData) { /* ... */ }
  async delete(id: number) { /* ... */ }
}
```

### 4. Service

```typescript
// src/modules/article/article.service.ts
export class ArticleService {
  async getArticles() { /* ... */ }
  async getArticle(id: number) { /* ... */ }
  async createArticle(data: CreateArticleData) { /* ... */ }
  async updateArticle(id: number, data: UpdateArticleData) { /* ... */ }
  async deleteArticle(id: number) { /* ... */ }
}
```

### 5. Route

```typescript
// src/modules/article/article.route.ts
const articleRoute = new Hono();

articleRoute.get('/', async (c) => { /* 获取列表 */ });
articleRoute.get('/:id', async (c) => { /* 获取单个 */ });
articleRoute.post('/', authMiddleware, async (c) => { /* 创建 */ });
articleRoute.put('/:id', authMiddleware, async (c) => { /* 更新 */ });
articleRoute.delete('/:id', authMiddleware, async (c) => { /* 删除 */ });
```

## 💡 对比传统开发

### 传统方式

1. ❌ 手写 Schema 文件（50+ 行）
2. ❌ 手写 Validator 文件（30+ 行）
3. ❌ 手写 Repository 文件（80+ 行）
4. ❌ 手写 Service 文件（60+ 行）
5. ❌ 手写 Route 文件（80+ 行）
6. ❌ 手动注册到 schema/index.ts
7. ❌ 手动注册到 router.ts

**总计**：~300 行代码 + 手动注册 = **30-60 分钟**

### JSON 模型方式

1. ✅ 创建 JSON 文件（20 行）
2. ✅ 运行一个命令
3. ✅ 完成！

**总计**：20 行配置 + 1 个命令 = **5 分钟**

**效率提升**：**6-12 倍！**

## 🎯 更多示例

### 电商商品

```json
{
  "name": "Product",
  "fields": [
    { "name": "id", "type": "integer", "primaryKey": true, "autoIncrement": true },
    { "name": "name", "type": "string", "required": true },
    { "name": "price", "type": "decimal", "precision": 10, "scale": 2, "required": true },
    { "name": "stock", "type": "integer", "default": 0 },
    { "name": "categoryId", "type": "integer", "reference": { "table": "categories", "field": "id" } }
  ]
}
```

### 用户评论

```json
{
  "name": "Comment",
  "fields": [
    { "name": "id", "type": "integer", "primaryKey": true, "autoIncrement": true },
    { "name": "content", "type": "text", "required": true },
    { "name": "userId", "type": "integer", "required": true, "reference": { "table": "users", "field": "id" } },
    { "name": "articleId", "type": "integer", "required": true, "reference": { "table": "articles", "field": "id" } }
  ],
  "softDelete": true
}
```

### 订单系统

```json
{
  "name": "Order",
  "fields": [
    { "name": "id", "type": "uuid", "primaryKey": true },
    { "name": "orderNo", "type": "string", "required": true, "unique": true },
    { "name": "userId", "type": "integer", "required": true, "reference": { "table": "users", "field": "id" } },
    { "name": "totalAmount", "type": "decimal", "precision": 10, "scale": 2, "required": true },
    { "name": "status", "type": "string", "default": "pending",
      "validation": { "enum": ["pending", "paid", "shipped", "completed"] } }
  ]
}
```

## 📚 下一步

### 🎛️ 配置式加载

如果你只想加载部分模型（提升性能、减少内存占用），可以使用配置式加载：

```typescript
// src/models/index.ts
export const models = loadModelsSync({
  article: true,
  product: true,
  // 只加载这里列出的模型
});
```

优势：
- ✅ **简洁**：只需 `{模型名: true}`
- ✅ **高效**：只加载需要的模型
- ✅ **明确**：清楚知道加载了哪些模型

### 📖 更多资源

- 📖 [完整 JSON 模型指南](./JSON_MODEL.md) - 了解所有配置选项
- ✨ [约定式开发](./CONVENTION_AND_CONFIGURATION.md) - 自动化开发流程
- 🔀 [路由管理](./ROUTER.md) - 路由系统说明

## 🎉 总结

使用 JSON 模型定义：

- ✅ **超简洁** - 只需 20 行配置
- ✅ **超快速** - 5 分钟完成完整模块
- ✅ **超安全** - JSON Schema 自动验证
- ✅ **超智能** - 默认值自动应用

**立即开始使用 JSON 模型，享受极速开发体验！** 🚀
