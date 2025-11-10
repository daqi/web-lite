import { db } from '../../db/client';
import { product } from '../../db/schema/product';
import { eq } from 'drizzle-orm';
import type { CreateProductInput, UpdateProductInput } from '../../validators/product.validator';

export class ProductRepository {
  async findAll() {
    return await db.select().from(product);
  }

  async findById(id: number) {
    const result = await db.select().from(product).where(eq(product.id, id));
    return result[0] || null;
  }

  async create(data: CreateProductInput) {
    const result = await db.insert(product).values(data).returning();
    return result[0];
  }

  async update(id: number, data: UpdateProductInput) {
    const result = await db.update(product).set(data).where(eq(product.id, id)).returning();
    return result[0] || null;
  }

  async delete(id: number) {
    await db.delete(product).where(eq(product.id, id));
  }
}
