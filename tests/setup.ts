import { beforeAll, afterAll } from 'vitest';
import { db } from '../src/db/client';
import { user, product, order, authUsers, refreshTokens } from '../src/db/schema';
import { sql } from 'drizzle-orm';

// 在所有测试之前清理数据库
beforeAll(async () => {
  console.log('🧹 清理测试数据库...');

  // 删除所有测试数据
  await db.delete(refreshTokens);
  await db.delete(authUsers);
  await db.delete(order);
  await db.delete(product);
  await db.delete(user);

  // 重置序列(如果使用 serial id)
  await db.execute(sql`ALTER SEQUENCE IF EXISTS auth_users_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE IF EXISTS refresh_tokens_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE IF EXISTS user_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE IF EXISTS product_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE IF EXISTS order_id_seq RESTART WITH 1`);

  console.log('✅ 数据库清理完成');
});

// 在所有测试之后关闭数据库连接
afterAll(async () => {
  console.log('🔌 关闭数据库连接');
});
