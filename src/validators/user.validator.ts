import * as v from 'valibot';

/**
 * 用户管理 Validators
 * Auto-generated from model definition
 */

// 创建 User 验证器
export const createUserSchema = v.object({
  username: v.pipe(v.string(), v.regex(/^[a-zA-Z0-9_]{3,20}$/)),
  email: v.pipe(v.string(), v.email()),
  website: v.optional(v.pipe(v.string(), v.url())),
  phone: v.optional(v.pipe(v.string(), v.regex(/^1[3-9]\d{9}$/))),
  role: v.picklist(['user', 'admin', 'moderator']),
});

// 更新 User 验证器
export const updateUserSchema = v.object({
  username: v.optional(v.pipe(v.string(), v.regex(/^[a-zA-Z0-9_]{3,20}$/))),
  email: v.optional(v.pipe(v.string(), v.email())),
  website: v.optional(v.pipe(v.string(), v.url())),
  phone: v.optional(v.pipe(v.string(), v.regex(/^1[3-9]\d{9}$/))),
  role: v.optional(v.picklist(['user', 'admin', 'moderator'])),
});

export type CreateUserInput = v.InferInput<typeof createUserSchema>;
export type UpdateUserInput = v.InferInput<typeof updateUserSchema>;
