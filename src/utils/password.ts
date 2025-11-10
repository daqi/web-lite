import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class PasswordService {
  /**
   * 加密密码
   */
  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * 验证密码
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
