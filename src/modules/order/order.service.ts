import { OrderRepository } from './order.repository';
import type { Order, NewOrder } from '../../db/schema/order';

/**
 * 订单管理 Service
 * Auto-generated from model definition
 */
export class OrderService {
  private orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async getAll(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async getById(id: number): Promise<Order | undefined> {
    return this.orderRepository.findById(id);
  }

  async create(data: NewOrder): Promise<Order> {
    return this.orderRepository.create(data);
  }

  async update(id: number, data: Partial<NewOrder>): Promise<Order | undefined> {
    return this.orderRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.orderRepository.delete(id);
  }
}
