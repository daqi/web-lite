import { db } from '../../db/client';
import { product, type Product, type NewProduct } from '../../db/schema/product';
import { eq } from 'drizzle-orm';

/**
 * 商品管理模型 Repository
 * Auto-generated from model definition
 */
export class ProductRepository {
  async findAll(): Promise<Product[]> {
    return db.select().from(product);
  }

  async findById(id: number): Promise<Product | undefined> {
    const result = await db.select().from(product).where(eq(product.id, id));
    return result[0];
  }

  async create(data: NewProduct): Promise<Product> {
    const result = await db.insert(product).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewProduct>): Promise<Product | undefined> {
    const result = await db
      .update(product)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(product.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    // 软删除
    const result = await db
      .update(product)
      .set({ deletedAt: new Date() })
      .where(eq(product.id, id))
      .returning();
    return result.length > 0;
  }
}
