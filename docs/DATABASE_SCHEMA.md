# 📊 数据库 Schema 说明

## 表结构

### 1. Users (用户表)

```typescript
user {
  id: serial (主键, 自增)
  name: varchar(50) (非空)
  email: varchar(100) (非空)
  createdAt: timestamp (默认当前时间)
}
```

**用途**: 存储用户基本信息

**API 端点**: `/user`

---

### 2. Products (商品表)

```typescript
product {
  id: serial (主键, 自增)
  name: varchar(100) (非空)
  description: text (可选)
  price: decimal(10,2) (非空, 价格)
  stock: integer (默认 0, 库存)
  category: varchar(50) (可选, 分类)
  imageUrl: varchar(255) (可选, 图片链接)
  createdAt: timestamp (创建时间)
  updatedAt: timestamp (更新时间)
}
```

**用途**: 存储商品信息

**API 端点**: `/product`

**字段说明**:
- `price`: 使用 decimal 类型存储价格,保证精度
- `stock`: 库存数量
- `category`: 商品分类,如: "电子产品", "图书", "服装" 等
- `imageUrl`: 商品图片 URL

---

### 3. Orders (订单表)

```typescript
order {
  id: serial (主键, 自增)
  userId: integer (外键 -> user.id)
  productId: integer (外键 -> product.id)
  quantity: integer (默认 1, 购买数量)
  totalPrice: decimal(10,2) (非空, 总价)
  status: varchar(20) (默认 'pending', 订单状态)
  shippingAddress: varchar(255) (可选, 收货地址)
  orderNumber: varchar(50) (非空, 唯一, 订单号)
  createdAt: timestamp (创建时间)
  updatedAt: timestamp (更新时间)
}
```

**用途**: 存储订单信息

**API 端点**: `/order`

**订单状态**:
- `pending`: 待确认
- `confirmed`: 已确认
- `shipped`: 已发货
- `delivered`: 已送达
- `cancelled`: 已取消

**外键关系**:
- `userId` → `user.id`: 订单所属用户
- `productId` → `product.id`: 订单商品

---

## 表关系图

```
┌──────────┐
│  Users   │
│  (用户)   │
└────┬─────┘
     │
     │ 1:N (一对多)
     │
┌────▼─────┐         ┌───────────┐
│  Orders  │ N:1     │  Products │
│  (订单)   ├────────►│  (商品)    │
└──────────┘         └───────────┘
```

**关系说明**:
- 一个用户可以有多个订单 (1:N)
- 一个订单对应一个商品 (N:1)
- 一个商品可以被多个订单引用 (1:N)

---

## 使用示例

### 创建商品

```bash
curl -X POST http://localhost:3000/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "最新款苹果手机",
    "price": "7999.00",
    "stock": 100,
    "category": "电子产品",
    "imageUrl": "https://example.com/iphone15.jpg"
  }'
```

### 创建订单

```bash
curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "totalPrice": "15998.00",
    "status": "pending",
    "shippingAddress": "北京市朝阳区xxx",
    "orderNumber": "ORD20250110001"
  }'
```

### 查询用户的所有订单

可以在 `order.repository.ts` 中添加:

```typescript
async findByUserId(userId: number) {
  return await db.select()
    .from(order)
    .where(eq(order.userId, userId));
}
```

### 查询订单详情(包含用户和商品信息)

```typescript
async findOrderWithDetails(orderId: number) {
  return await db.select()
    .from(order)
    .leftJoin(user, eq(order.userId, user.id))
    .leftJoin(product, eq(order.productId, product.id))
    .where(eq(order.id, orderId));
}
```

---

## 数据库操作

### 查看所有表

```bash
pnpm run db:studio
```

这会在浏览器中打开 Drizzle Studio,可视化管理数据库。

### 重新推送 Schema

如果修改了表结构:

```bash
pnpm run db:push
```

### 生成 Validators

修改 schema 后重新生成校验器:

```bash
pnpm run generate:validators
```

---

## 最佳实践

### 1. 价格处理
- 数据库使用 `decimal` 类型
- API 传输使用字符串格式: `"7999.00"`
- 避免使用浮点数,防止精度丢失

### 2. 订单号生成
建议在 service 层自动生成:
```typescript
const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
```

### 3. 库存管理
创建订单时应该:
1. 检查库存是否充足
2. 扣减库存
3. 使用事务确保数据一致性

### 4. 软删除
如需实现软删除,可以添加 `deletedAt` 字段:
```typescript
deletedAt: timestamp('deleted_at'),
```

---

## 迁移 & 回滚

当前使用 `db:push` 直接同步 schema,适合开发环境。

生产环境建议使用迁移:

```bash
# 生成迁移文件
pnpm drizzle-kit generate

# 执行迁移
pnpm drizzle-kit migrate
```

---

## 索引优化建议

对于高频查询字段,建议添加索引:

```typescript
// 在 product.ts 中
export const product = pgTable('product', {
  // ... 字段定义
}, (table) => ({
  categoryIdx: index('category_idx').on(table.category),
  priceIdx: index('price_idx').on(table.price),
}));

// 在 order.ts 中
export const order = pgTable('order', {
  // ... 字段定义
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  statusIdx: index('status_idx').on(table.status),
  orderNumberIdx: uniqueIndex('order_number_idx').on(table.orderNumber),
}));
```
