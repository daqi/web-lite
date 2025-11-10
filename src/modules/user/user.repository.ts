import { db } from '../../db/client';
import { user } from '../../db/schema/user';
import { eq } from 'drizzle-orm';
import type { CreateUserInput, UpdateUserInput } from '../../validators/user.validator';

export class UserRepository {
  async findAll() {
    return await db.select().from(user);
  }

  async findById(id: number) {
    const result = await db.select().from(user).where(eq(user.id, id));
    return result[0] || null;
  }

  async create(data: CreateUserInput) {
    const result = await db.insert(user).values(data).returning();
    return result[0];
  }

  async update(id: number, data: UpdateUserInput) {
    const result = await db.update(user).set(data).where(eq(user.id, id)).returning();
    return result[0] || null;
  }

  async delete(id: number) {
    await db.delete(user).where(eq(user.id, id));
  }
}
