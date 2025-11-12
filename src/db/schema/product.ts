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
import { category } from './category';

/**
 * 商品管理
 */
export const product = pgTable('products', {
  id: serial('id').primaryKey(), // 商品ID
  name: varchar('name', { length: 255 }).notNull(), // 商品名称
  description: text('description'), // 商品描述
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // 商品价格
  stock: integer('stock').notNull().default(0), // 库存数量
  categoryId: integer('categoryId').notNull(), // 所属分类ID
  sku: varchar('sku', { length: 255 }).unique(), // 商品SKU
  isActive: boolean('isActive').default(true), // 是否上架
  createdAt: timestamp('createdAt').notNull().defaultNow(), // 创建时间
  updatedAt: timestamp('updatedAt').notNull().defaultNow(), // 更新时间
});

export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;

export const productRelations = relations(product, ({ one }) => ({
  categoryIdRelation: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
}));
