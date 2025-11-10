import { db } from '../../db/client';
import { authUsers, refreshTokens } from '../../db/schema/auth';
import { eq, and, gt, lt } from 'drizzle-orm';
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
    await db.update(authUsers).set({ lastLoginAt: new Date() }).where(eq(authUsers.id, userId));
  }

  // 刷新令牌相关
  async createRefreshToken(userId: number, token: string, expiresAt: Date, deviceInfo?: string) {
    const result = await db
      .insert(refreshTokens)
      .values({
        userId,
        token,
        expiresAt,
        deviceInfo,
      })
      .returning();
    return result[0];
  }

  async findRefreshToken(token: string) {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.token, token), gt(refreshTokens.expiresAt, new Date())));
    return result[0] || null;
  }

  async deleteRefreshToken(token: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteUserRefreshTokens(userId: number) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  async cleanExpiredTokens() {
    await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
  }

  async countUserRefreshTokens(userId: number) {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.userId, userId), gt(refreshTokens.expiresAt, new Date())));
    return result.length;
  }

  async deleteOldestUserRefreshToken(userId: number) {
    const tokens = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId))
      .orderBy(refreshTokens.createdAt);

    if (tokens.length > 0) {
      await db.delete(refreshTokens).where(eq(refreshTokens.id, tokens[0].id));
    }
  }
}
