# 🔐 JWT 认证模块

## 概述

完整的 JWT (JSON Web Token) 认证系统,支持用户注册、登录、令牌刷新和登出功能。

## 功能特性

- ✅ 用户注册与登录
- ✅ JWT 访问令牌 (Access Token)
- ✅ 刷新令牌 (Refresh Token)
- ✅ 密码加密 (bcrypt)
- ✅ 令牌刷新机制
- ✅ 登出功能 (单设备/所有设备)
- ✅ 用户个人信息获取
- ✅ 多设备登录支持 (最多5个设备)
- ✅ 自动清理过期令牌
- ✅ 设备信息追踪

## 📋 数据库表

### auth_users (认证用户表)
```sql
id              serial PRIMARY KEY
username        varchar(50) UNIQUE NOT NULL
email           varchar(100) UNIQUE NOT NULL
password        varchar(255) NOT NULL  -- bcrypt hash
is_active       boolean DEFAULT true
last_login_at   timestamp
created_at      timestamp DEFAULT NOW()
updated_at      timestamp DEFAULT NOW()
```

### refresh_tokens (刷新令牌表)
```sql
id          serial PRIMARY KEY
user_id     integer REFERENCES auth_users(id)
token       varchar(500) UNIQUE NOT NULL
expires_at  timestamp NOT NULL
created_at  timestamp DEFAULT NOW()
```

## 🔑 环境变量

在 `.env` 文件中配置:

```bash
# JWT 密钥 (生产环境必须修改!)
JWT_SECRET=your-secret-key-change-in-production-please

# 访问令牌有效期 (1小时)
JWT_EXPIRES_IN=1h

# 刷新令牌有效期 (7天)
REFRESH_TOKEN_EXPIRES_IN=7d
```

## 📝 API 端点

### 1. 用户注册
```bash
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. 用户登录
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**响应**: 同注册

### 3. 刷新令牌
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**:
```json
{
  "accessToken": "new_access_token...",
  "refreshToken": "new_refresh_token..."
}
```

### 4. 获取用户信息 🔒
```bash
GET /auth/profile
Authorization: Bearer <accessToken>
```

**响应**:
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "isActive": true,
  "lastLoginAt": "2025-11-10T14:30:00Z",
  "createdAt": "2025-11-10T10:00:00Z"
}
```

### 5. 登出 🔒
```bash
POST /auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "token_to_invalidate..."
}
```

### 6. 登出所有设备 🔒
```bash
POST /auth/logout-all
Authorization: Bearer <accessToken>
```

> 🔒 表示需要在请求头中包含 `Authorization: Bearer <token>`

## 🛡️ 认证中间件

### authMiddleware - 强制认证

```typescript
import { authMiddleware } from './middlewares/auth';

// 在路由中使用
route.get('/protected', authMiddleware, async (c) => {
  const user = c.get('user'); // JWTPayload
  return c.json({ userId: user.userId });
});
```

### optionalAuthMiddleware - 可选认证

```typescript
import { optionalAuthMiddleware } from './middlewares/auth';

// 可选认证 - 有 token 就解析,没有也继续
route.get('/public', optionalAuthMiddleware, async (c) => {
  const user = c.get('user'); // 可能为 undefined
  if (user) {
    // 已认证用户逻辑
  } else {
    // 未认证用户逻辑
  }
});
```

## 💻 使用示例

### 客户端认证流程

```javascript
// 1. 登录获取 token
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'password123'
  })
});

const { accessToken, refreshToken } = await loginResponse.json();

// 2. 使用 accessToken 访问受保护资源
const profileResponse = await fetch('http://localhost:3000/auth/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 3. accessToken 过期时刷新
const refreshResponse = await fetch('http://localhost:3000/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const { accessToken: newAccessToken } = await refreshResponse.json();
```

## 🔧 工具类

### JWTService

```typescript
import { JWTService } from './utils/jwt';

// 生成令牌
const accessToken = JWTService.generateAccessToken(payload);
const refreshToken = JWTService.generateRefreshToken(payload);

// 验证令牌
try {
  const payload = JWTService.verifyToken(token);
} catch (error) {
  // Token 无效或过期
}

// 解码令牌(不验证)
const payload = JWTService.decodeToken(token);
```

### PasswordService

```typescript
import { PasswordService } from './utils/password';

// 加密密码
const hash = await PasswordService.hash('password123');

// 验证密码
const isValid = await PasswordService.verify('password123', hash);
```

## 🧪 测试

测试覆盖:
- ✅ 用户注册
- ✅ 用户登录
- ✅ 获取用户信息
- ✅ 无效 token 处理
- ✅ 令牌刷新
- ✅ 用户登出
- ✅ 已失效 token 验证

## 🔒 安全最佳实践

### 1. 密钥管理
```bash
# ❌ 不要在代码中硬编码密钥
JWT_SECRET=my-secret

# ✅ 使用强随机密钥
JWT_SECRET=$(openssl rand -base64 32)
```

### 2. HTTPS
生产环境必须使用 HTTPS,防止 token 被窃取。

### 3. Token 过期时间
- Access Token: 短期 (15min - 1h)
- Refresh Token: 长期 (7d - 30d)

### 4. 刷新令牌轮换
每次刷新时生成新的 refresh token,使旧 token 失效。

### 5. 存储
```javascript
// ✅ 推荐: HttpOnly Cookie (防 XSS)
document.cookie = `refreshToken=${token}; HttpOnly; Secure; SameSite=Strict`;

// ⚠️ 可接受: LocalStorage (需注意 XSS)
localStorage.setItem('accessToken', token);

// ❌ 不推荐: SessionStorage
```

## 📊 错误处理

| 状态码 | 错误 | 说明 |
|--------|------|------|
| 400 | Bad Request | 验证失败或业务逻辑错误 |
| 401 | Unauthorized | Token 无效、过期或缺失 |
| 404 | Not Found | 用户不存在 |

错误响应格式:
```json
{
  "error": "Invalid credentials"
}
```

## 📁 文件结构

```
src/
├── db/schema/
│   └── auth.ts              # Auth 数据表定义
├── middlewares/
│   └── auth.ts              # 认证中间件
├── modules/auth/
│   ├── auth.repository.ts   # 数据访问层
│   ├── auth.service.ts      # 业务逻辑层
│   ├── auth.route.ts        # 路由层
│   └── index.ts             # 模块导出
├── utils/
│   ├── jwt.ts               # JWT 工具
│   └── password.ts          # 密码加密工具
└── validators/
    └── auth.validator.ts    # 请求验证
```

## 🚀 扩展功能

### 多设备登录支持

系统支持同一用户在多个设备上同时登录，特性如下：

- **设备限制**: 默认最多支持 5 个设备同时登录
- **设备追踪**: 自动记录设备信息 (User-Agent)
- **智能清理**: 当设备数量超过限制时,自动删除最旧的令牌
- **过期清理**: 登录时自动清理所有过期的刷新令牌
- **唯一性保证**: 每次登录生成的刷新令牌都是唯一的 (包含随机 jti)

修改设备数量限制:
```typescript
// src/modules/auth/auth.service.ts
const MAX_DEVICES = 5; // 修改此值来改变设备限制
```

### 可以添加的其他功能:

1. **邮箱验证**
   - 注册时发送验证邮件
   - 验证码过期机制

2. **密码重置**
   - 忘记密码流程
   - 重置令牌管理

3. **OAuth 集成**
   - Google 登录
   - GitHub 登录

4. **双因素认证 (2FA)**
   - TOTP 支持
   - 短信验证

5. **IP 限制**
   - 记录登录 IP
   - 异常登录检测

6. **速率限制**
   - 防暴力破解
   - API 请求限流

7. **活跃设备管理**
   - 查看当前登录的所有设备
   - 手动登出指定设备

## 📚 相关文档

- [JWT 官方文档](https://jwt.io/)
- [bcrypt 文档](https://github.com/kelektiv/node.bcrypt.js)
- [Hono 中间件](https://hono.dev/docs/guides/middleware)
