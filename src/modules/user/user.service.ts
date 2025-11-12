import { UserRepository } from './user.repository';
import type { User, NewUser } from '../../db/schema/user';

/**
 * 用户管理 Service
 * Auto-generated from model definition
 */
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getById(id: number): Promise<User | undefined> {
    return this.userRepository.findById(id);
  }

  async create(data: NewUser): Promise<User> {
    return this.userRepository.create(data);
  }

  async update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    return this.userRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}
