import * as v from 'valibot';

export const createOrderSchema = v.object({
  userId: v.number(),
  productId: v.number(),
  quantity: v.number(),
  totalPrice: v.optional(v.pipe(v.string(), v.decimal())),
  status: v.optional(v.pipe(v.string(), v.maxLength(20))),
  shippingAddress: v.optional(v.pipe(v.string(), v.maxLength(255))),
  orderNumber: v.optional(v.pipe(v.string(), v.maxLength(50))),
});

export const updateOrderSchema = v.object({
  userId: v.optional(v.number()),
  productId: v.optional(v.number()),
  quantity: v.optional(v.number()),
  totalPrice: v.optional(v.pipe(v.string(), v.decimal())),
  status: v.optional(v.pipe(v.string(), v.maxLength(20))),
  shippingAddress: v.optional(v.pipe(v.string(), v.maxLength(255))),
  orderNumber: v.optional(v.pipe(v.string(), v.maxLength(50))),
});

export type CreateOrderInput = v.InferOutput<typeof createOrderSchema>;
export type UpdateOrderInput = v.InferOutput<typeof updateOrderSchema>;
