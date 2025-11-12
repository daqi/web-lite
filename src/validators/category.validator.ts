import * as v from 'valibot';

/**
 * 商品分类 Validators
 * Auto-generated from model definition
 */

// 创建 Category 验证器
export const createCategorySchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  slug: v.string(),
  description: v.optional(v.string()),
  parentId: v.optional(v.number()),
  order: v.number(),
});

// 更新 Category 验证器
export const updateCategorySchema = v.object({
  name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
  slug: v.optional(v.string()),
  description: v.optional(v.string()),
  parentId: v.optional(v.number()),
  order: v.optional(v.number()),
});

export type CreateCategoryInput = v.InferInput<typeof createCategorySchema>;
export type UpdateCategoryInput = v.InferInput<typeof updateCategorySchema>;
