import { ProductRepository } from './product.repository';
import type { Product, NewProduct } from '../../db/schema/product';

/**
 * 商品管理模型 Service
 * Auto-generated from model definition
 */
export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getById(id: number): Promise<Product | undefined> {
    return this.productRepository.findById(id);
  }

  async create(data: NewProduct): Promise<Product> {
    return this.productRepository.create(data);
  }

  async update(id: number, data: Partial<NewProduct>): Promise<Product | undefined> {
    return this.productRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.productRepository.delete(id);
  }
}
