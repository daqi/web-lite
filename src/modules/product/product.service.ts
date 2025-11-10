import { ProductRepository } from './product.repository';
import type { CreateProductInput, UpdateProductInput } from '../../validators/product.validator';

export class ProductService {
  private repository = new ProductRepository();

  async list() {
    return await this.repository.findAll();
  }

  async get(id: number) {
    const item = await this.repository.findById(id);
    if (!item) throw new Error('Product not found');
    return item;
  }

  async create(data: CreateProductInput) {
    return await this.repository.create(data);
  }

  async update(id: number, data: UpdateProductInput) {
    const item = await this.repository.update(id, data);
    if (!item) throw new Error('Product not found');
    return item;
  }

  async delete(id: number) {
    await this.repository.delete(id);
  }
}
