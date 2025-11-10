import { OrderRepository } from './order.repository';
import type { CreateOrderInput, UpdateOrderInput } from '../../validators/order.validator';

export class OrderService {
  private repository = new OrderRepository();

  async list() {
    return await this.repository.findAll();
  }

  async get(id: number) {
    const item = await this.repository.findById(id);
    if (!item) throw new Error('Order not found');
    return item;
  }

  async create(data: CreateOrderInput) {
    return await this.repository.create(data);
  }

  async update(id: number, data: UpdateOrderInput) {
    const item = await this.repository.update(id, data);
    if (!item) throw new Error('Order not found');
    return item;
  }

  async delete(id: number) {
    await this.repository.delete(id);
  }
}
