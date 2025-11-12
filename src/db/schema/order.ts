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
import { relations } from 'drizzle-orm';
import { user } from './user';

/**
 * 订单管理
 */
export const order = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNo: varchar('orderNo', { length: 50 }).notNull().unique(), // 订单号（格式: ORD-12345678）
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 订单状态
  totalAmount: decimal('totalAmount', { precision: 12, scale: 2 }).notNull(), // 订单总金额
  userId: integer('userId').notNull(), // 用户ID
  createdAt: timestamp('createdAt').notNull().defaultNow(), // 创建时间
  updatedAt: timestamp('updatedAt').notNull().defaultNow(), // 更新时间
});

export type Order = typeof order.$inferSelect;
export type NewOrder = typeof order.$inferInsert;

export const orderRelations = relations(order, ({ one }) => ({
  userIdRelation: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
}));
