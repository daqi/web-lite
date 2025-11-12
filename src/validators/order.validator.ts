import * as v from 'valibot';

/**
 * 订单管理 Validators
 * Auto-generated from model definition
 */

// 创建 Order 验证器
export const createOrderSchema = v.object({
  orderNo: v.pipe(v.string(), v.regex(/^ORD-[0-9]{8}$/)),
  status: v.picklist(['pending', 'paid', 'shipped', 'completed', 'cancelled']),
  totalAmount: v.pipe(v.string(), v.regex(/^\d+(\.\d{1,2})?$/)),
  userId: v.number(),
});

// 更新 Order 验证器
export const updateOrderSchema = v.object({
  orderNo: v.optional(v.pipe(v.string(), v.regex(/^ORD-[0-9]{8}$/))),
  status: v.optional(v.picklist(['pending', 'paid', 'shipped', 'completed', 'cancelled'])),
  totalAmount: v.optional(v.pipe(v.string(), v.regex(/^\d+(\.\d{1,2})?$/))),
  userId: v.optional(v.number()),
});

export type CreateOrderInput = v.InferInput<typeof createOrderSchema>;
export type UpdateOrderInput = v.InferInput<typeof updateOrderSchema>;
