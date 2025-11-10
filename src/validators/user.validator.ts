import * as v from 'valibot';

export const createUserSchema = v.object({
  name: v.pipe(v.string(), v.maxLength(50)),
  email: v.pipe(v.string(), v.maxLength(100)),
});

export const updateUserSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.maxLength(50))),
  email: v.optional(v.pipe(v.string(), v.maxLength(100))),
});

export type CreateUserInput = v.InferOutput<typeof createUserSchema>;
export type UpdateUserInput = v.InferOutput<typeof updateUserSchema>;
