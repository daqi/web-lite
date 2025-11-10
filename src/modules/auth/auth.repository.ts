import { db } from '../../db/client';
import { authUsers, refreshTokens } from '../../db/schema/auth';
import { eq, and, gt } from 'drizzle-orm';
import type { RegisterInput } from '../../validators/auth.validator';

export class AuthRepository {
  // 用户相关
  async findUserByUsername(username: string) {
    const result = await db.select().from(authUsers).where(eq(authUsers.username, username));
    return result[0] || null;
  }

  async findUserByEmail(email: string) {
    const result = await db.select().from(authUsers).where(eq(authUsers.email, email));
    return result[0] || null;
  }

  async findUserById(id: number) {
    const result = await db.select().from(authUsers).where(eq(authUsers.id, id));
    return result[0] || null;
  }

  async createUser(data: RegisterInput & { password: string }) {
    const result = await db.insert(authUsers).values(data).returning();
    return result[0];
  }

  async updateLastLogin(userId: number) {
    await db
      .update(authUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(authUsers.id, userId));
  }

  // 刷新令牌相关
  async createRefreshToken(userId: number, token: string, expiresAt: Date) {
    const result = await db
      .insert(refreshTokens)
      .values({
        userId,
        token,
        expiresAt,
      })
      .returning();
    return result[0];
  }

  async findRefreshToken(token: string) {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, token),
          gt(refreshTokens.expiresAt, new Date())
        )
      );
    return result[0] || null;
  }

  async deleteRefreshToken(token: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteUserRefreshTokens(userId: number) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  async cleanExpiredTokens() {
    await db.delete(refreshTokens).where(gt(refreshTokens.expiresAt, new Date()));
  }
}
