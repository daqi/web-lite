import * as v from 'valibot';

export const registerSchema = v.object({
  username: v.pipe(v.string(), v.minLength(3), v.maxLength(50)),
  email: v.pipe(v.string(), v.email(), v.maxLength(100)),
  password: v.pipe(v.string(), v.minLength(6), v.maxLength(100)),
});

export const loginSchema = v.object({
  username: v.string(),
  password: v.string(),
});

export const refreshTokenSchema = v.object({
  refreshToken: v.string(),
});

export type RegisterInput = v.InferOutput<typeof registerSchema>;
export type LoginInput = v.InferOutput<typeof loginSchema>;
export type RefreshTokenInput = v.InferOutput<typeof refreshTokenSchema>;
