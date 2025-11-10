import { UserRepository } from './user.repository';
import type { CreateUserInput, UpdateUserInput } from '../../validators/user.validator';

export class UserService {
  private repository = new UserRepository();

  async list() {
    return await this.repository.findAll();
  }

  async get(id: number) {
    const user = await this.repository.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async create(data: CreateUserInput) {
    return await this.repository.create(data);
  }

  async update(id: number, data: UpdateUserInput) {
    const user = await this.repository.update(id, data);
    if (!user) throw new Error('User not found');
    return user;
  }

  async delete(id: number) {
    await this.repository.delete(id);
  }
}
