import * as v from 'valibot';

export const createProductSchema = v.object({
  name: v.pipe(v.string(), v.maxLength(100)),
  description: v.optional(v.string()),
  price: v.pipe(v.string(), v.decimal()),
  stock: v.number(),
  category: v.optional(v.pipe(v.string(), v.maxLength(50))),
  imageUrl: v.optional(v.pipe(v.string(), v.maxLength(255))),
});

export const updateProductSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.maxLength(100))),
  description: v.optional(v.string()),
  price: v.optional(v.pipe(v.string(), v.decimal())),
  stock: v.optional(v.number()),
  category: v.optional(v.pipe(v.string(), v.maxLength(50))),
  imageUrl: v.optional(v.pipe(v.string(), v.maxLength(255))),
});

export type CreateProductInput = v.InferOutput<typeof createProductSchema>;
export type UpdateProductInput = v.InferOutput<typeof updateProductSchema>;
