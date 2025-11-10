import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
