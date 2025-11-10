import { db } from '../../db/client';
import { order } from '../../db/schema/order';
import { eq } from 'drizzle-orm';
import type { CreateOrderInput, UpdateOrderInput } from '../../validators/order.validator';

export class OrderRepository {
  async findAll() {
    return await db.select().from(order);
  }

  async findById(id: number) {
    const result = await db.select().from(order).where(eq(order.id, id));
    return result[0] || null;
  }

  async create(data: CreateOrderInput) {
    const result = await db.insert(order).values(data).returning();
    return result[0];
  }

  async update(id: number, data: UpdateOrderInput) {
    const result = await db.update(order).set(data).where(eq(order.id, id)).returning();
    return result[0] || null;
  }

  async delete(id: number) {
    await db.delete(order).where(eq(order.id, id));
  }
}
