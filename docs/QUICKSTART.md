# 🚀 快速开始指南

## 1️⃣ 安装依赖

```bash
pnpm install
```

## 2️⃣ 配置数据库

### 选项 A: 使用本地 PostgreSQL

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件
# DATABASE_URL=postgresql://user:password@localhost:5432/web_lite
```

### 选项 B: 使用 Docker 快速启动 PostgreSQL

```bash
docker run --name postgres-web-lite \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=web_lite \
  -p 5432:5432 \
  -d postgres:16-alpine

# 然后在 .env 中设置:
# DATABASE_URL=postgresql://admin:admin123@localhost:5432/web_lite
```

## 3️⃣ 初始化数据库

```bash
# 推送 schema 到数据库
pnpm run db:push
```

## 4️⃣ 启动服务

```bash
pnpm run dev
```

服务将在 `http://localhost:3000` 启动

## 5️⃣ 测试 API

### 获取所有用户
```bash
curl http://localhost:3000/user
```

### 创建用户
```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","email":"zhangsan@example.com"}'
```

### 获取单个用户
```bash
curl http://localhost:3000/user/1
```

### 更新用户
```bash
curl -X PUT http://localhost:3000/user/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"李四"}'
```

### 删除用户
```bash
curl -X DELETE http://localhost:3000/user/1
```

## 6️⃣ 生成新模块

使用 JSON 模型驱动开发，快速生成完整模块！

### 步骤 1: 创建 JSON 模型

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
      "length": 100,
      "required": true
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

### 步骤 2: 生成代码

```bash
pnpm run generate:model product
```

这将自动生成：
- ✅ `src/db/schema/product.ts` - Drizzle Schema
- ✅ `src/validators/product.validator.ts` - Valibot Validator
- ✅ `src/modules/product/product.repository.ts` - Repository
- ✅ `src/modules/product/product.service.ts` - Service
- ✅ `src/modules/product/product.route.ts` - Route
- ✅ `src/modules/product/index.ts` - 模块导出
- ✅ 自动注册到 `schema/index.ts`
- ✅ 自动注册到 `router.ts`

### 步骤 3: 更新数据库

```bash
pnpm run db:push
```

### 步骤 4: 测试 API
import { userRoute } from './modules/user';
import { productRoute } from './modules/product';  // 添加

app.route('/user', userRoute);
app.route('/product', productRoute);  // 添加
```

**步骤 6**: 重启服务
```bash
# Ctrl+C 停止,然后重新运行
pnpm run dev
```

## 🎉 完成!

现在你可以访问:
- `http://localhost:3000/user`
- `http://localhost:3000/product`

## 🔧 其他有用命令

```bash
# 打开 Drizzle Studio (数据库可视化工具)
pnpm run db:studio

# 重新生成所有 validators
pnpm run generate:validators

# 生产环境运行
pnpm start
```

## 💡 提示

1. **类型安全**: 所有的类型都是自动推导的,从数据库 → Validator → API
2. **热重载**: 使用 `tsx watch` 实现自动重启
3. **错误处理**: 已在 `app.ts` 中配置全局错误处理
4. **模型驱动**: JSON 模型自动生成全部代码，效率提升 15 倍
5. **智能验证**: 支持 regex、email、url、enum 等多种验证规则

## 📚 下一步

- 查看 [JSON_MODEL_QUICKSTART.md](./JSON_MODEL_QUICKSTART.md) 快速上手 JSON 模型
- 探索 [JSON_MODEL.md](./JSON_MODEL.md) 了解完整的模型定义指南
- 阅读 [JSON_MODEL_FIELD_CONFIG.md](./JSON_MODEL_FIELD_CONFIG.md) 学习所有字段配置选项
