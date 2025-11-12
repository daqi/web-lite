import { CategoryRepository } from './category.repository';
import type { Category, NewCategory } from '../../db/schema/category';

/**
 * 商品分类 Service
 * Auto-generated from model definition
 */
export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async getById(id: number): Promise<Category | undefined> {
    return this.categoryRepository.findById(id);
  }

  async create(data: NewCategory): Promise<Category> {
    return this.categoryRepository.create(data);
  }

  async update(id: number, data: Partial<NewCategory>): Promise<Category | undefined> {
    return this.categoryRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.categoryRepository.delete(id);
  }
}
