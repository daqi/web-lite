import * as v from 'valibot';

/**
 * 商品管理 Validators
 * Auto-generated from model definition
 */

// 创建 Product 验证器
export const createProductSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  description: v.optional(v.string()),
  price: v.pipe(v.string(), v.regex(/^\d+(\.\d{1,2})?$/)),
  stock: v.pipe(v.number(), v.minValue(0)),
  categoryId: v.number(),
  sku: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
});

// 更新 Product 验证器
export const updateProductSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
  description: v.optional(v.string()),
  price: v.optional(v.pipe(v.string(), v.regex(/^\d+(\.\d{1,2})?$/))),
  stock: v.optional(v.pipe(v.number(), v.minValue(0))),
  categoryId: v.optional(v.number()),
  sku: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
});

export type CreateProductInput = v.InferInput<typeof createProductSchema>;
export type UpdateProductInput = v.InferInput<typeof updateProductSchema>;
