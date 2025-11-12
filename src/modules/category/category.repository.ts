import { db } from '../../db/client';
import { category, type Category, type NewCategory } from '../../db/schema/category';
import { eq } from 'drizzle-orm';

/**
 * 商品分类 Repository
 * Auto-generated from model definition
 */
export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    return db.select().from(category);
  }

  async findById(id: number): Promise<Category | undefined> {
    const result = await db.select().from(category).where(eq(category.id, id));
    return result[0];
  }

  async create(data: NewCategory): Promise<Category> {
    const result = await db.insert(category).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewCategory>): Promise<Category | undefined> {
    const result = await db
      .update(category)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(category.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    // 硬删除
    const result = await db.delete(category).where(eq(category.id, id)).returning();
    return result.length > 0;
  }
}
