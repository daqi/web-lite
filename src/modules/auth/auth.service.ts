import { AuthRepository } from './auth.repository';
import { JWTService } from '../../utils/jwt';
import { PasswordService } from '../../utils/password';
import type { RegisterInput, LoginInput } from '../../validators/auth.validator';

export class AuthService {
  private repository = new AuthRepository();

  /**
   * 用户注册
   */
  async register(data: RegisterInput) {
    // 检查用户名是否存在
    const existingUser = await this.repository.findUserByUsername(data.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // 检查邮箱是否存在
    const existingEmail = await this.repository.findUserByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // 加密密码
    const hashedPassword = await PasswordService.hash(data.password);

    // 创建用户
    const user = await this.repository.createUser({
      ...data,
      password: hashedPassword,
    });

    // 生成令牌
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = JWTService.generateAccessToken(payload);
    const refreshToken = JWTService.generateRefreshToken(payload);

    // 保存刷新令牌
    const expiresAt = JWTService.getRefreshTokenExpiryDate();
    await this.repository.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * 用户登录
   */
  async login(data: LoginInput) {
    // 查找用户
    const user = await this.repository.findUserByUsername(data.username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 检查用户是否激活
    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // 验证密码
    const isValid = await PasswordService.verify(data.password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // 更新最后登录时间
    await this.repository.updateLastLogin(user.id);

    // 生成令牌
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = JWTService.generateAccessToken(payload);
    const refreshToken = JWTService.generateRefreshToken(payload);

    // 保存刷新令牌(为了避免重复token,先删除该用户的所有旧token)
    // 注意:这会导致其他设备登出,如果需要多设备同时登录,需要改进这个逻辑
    await this.repository.deleteUserRefreshTokens(user.id);

    const expiresAt = JWTService.getRefreshTokenExpiryDate();
    await this.repository.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * 刷新令牌
   */
  async refreshToken(token: string) {
    // 验证令牌
    let payload;
    try {
      payload = JWTService.verifyToken(token);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // 检查令牌是否在数据库中
    const storedToken = await this.repository.findRefreshToken(token);
    if (!storedToken) {
      throw new Error('Refresh token not found or expired');
    }

    // 查找用户
    const user = await this.repository.findUserById(payload.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // 删除旧的刷新令牌
    await this.repository.deleteRefreshToken(token);

    // 生成新令牌
    const newPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = JWTService.generateAccessToken(newPayload);
    const refreshToken = JWTService.generateRefreshToken(newPayload);

    // 保存新的刷新令牌
    const expiresAt = JWTService.getRefreshTokenExpiryDate();
    await this.repository.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 登出
   */
  async logout(token: string) {
    await this.repository.deleteRefreshToken(token);
  }

  /**
   * 登出所有设备
   */
  async logoutAll(userId: number) {
    await this.repository.deleteUserRefreshTokens(userId);
  }

  /**
   * 获取用户信息
   */
  async getProfile(userId: number) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}
