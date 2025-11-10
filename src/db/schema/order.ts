import { pgTable, serial, integer, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';

export const order = pgTable('order', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull().default('0'),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, confirmed, shipped, delivered, cancelled
  shippingAddress: varchar('shipping_address', { length: 255 }),
  orderNumber: varchar('order_number', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
