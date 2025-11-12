import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  jsonb,
} from 'drizzle-orm/pg-core';

/**
 * 用户管理
 */
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(), // 用户名（3-20位字母数字下划线）
  email: varchar('email', { length: 100 }).notNull().unique(), // 邮箱
  website: varchar('website', { length: 200 }), // 个人网站
  phone: varchar('phone', { length: 20 }), // 手机号
  role: varchar('role', { length: 20 }).notNull().default('user'), // 角色
  createdAt: timestamp('created_at').notNull().defaultNow(), // 创建时间
  updatedAt: timestamp('updated_at').notNull().defaultNow(), // 更新时间
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
