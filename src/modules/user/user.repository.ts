import { db } from '../../db/client';
import { user, type User, type NewUser } from '../../db/schema/user';
import { eq } from 'drizzle-orm';

/**
 * 用户管理 Repository
 * Auto-generated from model definition
 */
export class UserRepository {
  async findAll(): Promise<User[]> {
    return db.select().from(user);
  }

  async findById(id: number): Promise<User | undefined> {
    const result = await db.select().from(user).where(eq(user.id, id));
    return result[0];
  }

  async create(data: NewUser): Promise<User> {
    const result = await db.insert(user).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    const result = await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    // 硬删除
    const result = await db.delete(user).where(eq(user.id, id)).returning();
    return result.length > 0;
  }
}
