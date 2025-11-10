import { pgTable, serial, varchar, text, decimal, integer, timestamp } from 'drizzle-orm/pg-core';

export const product = pgTable('product', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(0),
  category: varchar('category', { length: 50 }),
  imageUrl: varchar('image_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
