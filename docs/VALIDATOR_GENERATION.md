# 📝 Validator 自动生成

## 概述

本项目使用自动化脚本从 Drizzle Schema 动态生成 Valibot validators,无需手动维护 validator 文件。

## 🎯 功能特性

✅ **自动扫描** - 动态扫描 `src/db/schema/` 目录中的所有表定义  
✅ **智能识别** - 通过 Drizzle Symbol 标识自动识别表对象  
✅ **类型映射** - 自动将 Drizzle 列类型映射为 Valibot validator  
✅ **孤立检测** - 自动检测并提示没有对应 schema 的 validator 文件  
✅ **无需手动导入** - 不需要在脚本中手动导入新表,自动发现所有表定义

## 🚀 使用方法

### 1. 生成 Validators

```bash
# 扫描所有 schema 并生成 validators
pnpm run generate:validators
```

### 2. 添加新表时的工作流

```bash
# 1. 创建新的 schema 文件
touch src/db/schema/categories.ts

# 2. 定义表结构
# src/db/schema/categories.ts
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
});

# 3. 同步到数据库
pnpm run db:push

# 4. 自动生成 validator (无需手动导入!)
pnpm run generate:validators
```

输出示例:
```
🔍 Scanning schema directory...

📦 Loaded table: categories from categories.ts
📦 Loaded table: order from order.ts
📦 Loaded table: product from product.ts
📦 Loaded table: user from user.ts

📊 Found 4 table(s): categories, order, product, user

🔨 Generating validators...

✅ Validator generated: categories
✅ Validator generated: order
✅ Validator generated: product
✅ Validator generated: user

🎉 All validators generated successfully!

📈 Summary:
   • Tables found: 4
   • Validators generated: 4
   • Orphaned validators: 0
```

## 📋 类型映射规则

| Drizzle 类型 | Valibot Validator |
|-------------|-------------------|
| `varchar(n)` | `v.pipe(v.string(), v.maxLength(n))` |
| `text()` | `v.string()` |
| `serial()` / `integer()` | `v.number()` |
| `numeric()` / `decimal()` | `v.pipe(v.string(), v.decimal())` |
| `boolean()` | `v.boolean()` |
| `timestamp()` / `date()` | `v.optional(v.pipe(v.string(), v.isoTimestamp()))` |

## 🔍 孤立文件检测

脚本会自动检测没有对应 schema 的 validator 文件:

```
⚠️  Found 2 orphaned validator(s):
   • oldUsers.validator.ts (no matching schema)
   • tempData.validator.ts (no matching schema)

💡 Consider removing orphaned validators manually.
```

当你删除或重命名 schema 文件后,旧的 validator 会被标记为孤立文件,可以手动删除。

## 🛠️ 生成的 Validator 示例

对于以下 schema:

```typescript
// src/db/schema/product.ts
export const product = pgTable('product', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

会生成:

```typescript
// src/validators/product.validator.ts
import * as v from 'valibot';

export const createProductsSchema = v.object({
  name: v.pipe(v.string(), v.maxLength(100)),
  description: v.optional(v.string()),
  price: v.pipe(v.string(), v.decimal()),
  stock: v.number(),
});

export const updateProductsSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.maxLength(100))),
  description: v.optional(v.string()),
  price: v.optional(v.pipe(v.string(), v.decimal())),
  stock: v.optional(v.number()),
});

export type CreateProductsInput = v.InferOutput<typeof createProductsSchema>;
export type UpdateProductsInput = v.InferOutput<typeof updateProductsSchema>;
```

## ⚙️ 脚本工作原理

1. **扫描阶段** - 读取 `src/db/schema/` 目录,排除 `index.ts`
2. **动态导入** - 使用 ES modules 动态导入每个 schema 文件
3. **表识别** - 通过检查 `Symbol(drizzle:IsDrizzleTable)` 识别表对象
4. **列提取** - 遍历表对象的所有属性,提取包含 `columnType` 的列定义
5. **类型映射** - 根据 `columnType` 映射到对应的 Valibot validator
6. **文件生成** - 生成 create/update schema 和 TypeScript 类型定义
7. **对比检测** - 比较现有 validator 文件,检测孤立文件

## 🎨 自定义配置

如果需要自定义类型映射,编辑 `scripts/generate-validators.ts`:

```typescript
function mapDrizzleTypeToValibot(col: any): string {
  const typeUpper = col.columnType.toUpperCase();
  
  // 添加自定义类型映射
  if (typeUpper.includes('UUID')) return 'v.pipe(v.string(), v.uuid())';
  if (typeUpper.includes('EMAIL')) return 'v.pipe(v.string(), v.email())';
  
  // ... 其他映射
}
```

## 📚 相关文档

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - 数据库设计文档
- [README.md](./README.md#-代码生成) - 代码生成总览
- [Valibot 官方文档](https://valibot.dev/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)

## 💡 最佳实践

1. **每次修改 schema 后运行生成器** - 保持 validators 与数据库同步
2. **使用类型安全** - 利用生成的 TypeScript 类型定义
3. **及时清理孤立文件** - 删除不再使用的 validator 文件
4. **版本控制** - 将生成的 validator 文件提交到 Git,便于代码审查
5. **CI/CD 集成** - 在部署前自动验证 validators 是否最新

```bash
# CI/CD 示例
pnpm run generate:validators
git diff --exit-code src/validators/  # 检查是否有未提交的更改
```
