import * as v from 'valibot';

/**
 * 商品管理模型 Validators
 * Auto-generated from model definition
 */

// 创建 Product 验证器
export const createProductSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  description: v.optional(v.string()),
  price: v.number(),
  stock: v.pipe(v.number(), v.minValue(0)),
  categoryId: v.optional(v.number()),
  isActive: v.boolean(),
  tags: v.optional(v.any()),
});

// 更新 Product 验证器
export const updateProductSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
  description: v.optional(v.string()),
  price: v.optional(v.number()),
  stock: v.optional(v.pipe(v.number(), v.minValue(0))),
  categoryId: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
  tags: v.optional(v.any()),
});

export type CreateProductInput = v.InferInput<typeof createProductSchema>;
export type UpdateProductInput = v.InferInput<typeof updateProductSchema>;
