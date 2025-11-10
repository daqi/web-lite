import { pgTable, serial, integer, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user';
import { product } from './product';

export const order = pgTable('order', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => user.id),
  productId: integer('product_id').notNull().references(() => product.id),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, confirmed, shipped, delivered, cancelled
  shippingAddress: varchar('shipping_address', { length: 255 }),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
