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

/**
 * 商品分类
 */
export const category = pgTable('categories', {
  id: serial('id').primaryKey(), // 分类ID
  name: varchar('name', { length: 255 }).notNull().unique(), // 分类名称
  slug: varchar('slug', { length: 255 }).notNull().unique(), // 分类标识符
  description: text('description'), // 分类描述
  parentId: integer('parentId'), // 父分类ID（支持多级分类）
  order: integer('order').notNull().default(0), // 排序顺序
  createdAt: timestamp('createdAt').notNull().defaultNow(), // 创建时间
  updatedAt: timestamp('updatedAt').notNull().defaultNow(), // 更新时间
});

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

export const categoryRelations = relations(category, ({ one }) => ({
  parentIdRelation: one(category, {
    fields: [category.parentId],
    references: [category.id],
  }),
}));
