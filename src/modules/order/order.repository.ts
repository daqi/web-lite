import { db } from '../../db/client';
import { order, type Order, type NewOrder } from '../../db/schema/order';
import { eq } from 'drizzle-orm';

/**
 * 订单管理 Repository
 * Auto-generated from model definition
 */
export class OrderRepository {
  async findAll(): Promise<Order[]> {
    return db.select().from(order);
  }

  async findById(id: number): Promise<Order | undefined> {
    const result = await db.select().from(order).where(eq(order.id, id));
    return result[0];
  }

  async create(data: NewOrder): Promise<Order> {
    const result = await db.insert(order).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewOrder>): Promise<Order | undefined> {
    const result = await db
      .update(order)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(order.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    // 硬删除
    const result = await db.delete(order).where(eq(order.id, id)).returning();
    return result.length > 0;
  }
}
