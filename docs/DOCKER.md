# 🐳 Docker Compose 使用指南

## 快速启动

### 启动数据库
```bash
docker-compose up -d
```

### 停止数据库
```bash
docker-compose down
```

### 重启数据库
```bash
docker-compose restart
```

### 查看日志
```bash
docker-compose logs -f postgres
```

### 停止并删除数据
```bash
docker-compose down -v
```

## 数据库连接信息

- **Host**: localhost
- **Port**: 5432
- **Database**: web_lite
- **User**: admin
- **Password**: admin123

**连接字符串**:
```
postgresql://admin:admin123@localhost:5432/web_lite
```

## 数据持久化

数据存储在 Docker volume `postgres_data` 中,即使容器被删除,数据也会保留。

要完全删除数据:
```bash
docker-compose down -v
```

## 健康检查

容器包含健康检查,确保 PostgreSQL 已准备好接受连接:
```bash
docker-compose ps
```

## 故障排除

### 端口冲突
如果 5432 端口被占用:
```bash
# 查看占用端口的进程
lsof -i :5432

# 修改 docker-compose.yaml 中的端口映射
# ports:
#   - "5433:5432"  # 使用 5433 端口

# 同时更新 .env 文件
# DATABASE_URL=postgresql://admin:admin123@localhost:5433/web_lite
```

### 重置数据库
```bash
# 停止并删除所有数据
docker-compose down -v

# 重新启动
docker-compose up -d

# 重新初始化表
pnpm run db:push
```

## 与现有容器的关系

如果你之前手动创建了容器 `postgres-web-lite`,需要先删除:
```bash
# 停止旧容器
docker stop postgres-web-lite

# 删除旧容器
docker rm postgres-web-lite

# 使用 docker-compose 启动
docker-compose up -d
```

## 完整开发流程

```bash
# 1. 启动数据库
docker-compose up -d

# 2. 等待数据库就绪
docker-compose ps

# 3. 初始化数据库表
pnpm run db:push

# 4. 启动开发服务器
pnpm run dev
```

## 生产环境建议

对于生产环境,建议:

1. 修改密码为强密码
2. 使用环境变量文件
3. 配置备份策略
4. 限制网络访问
5. 使用 Docker secrets

示例:
```yaml
environment:
  POSTGRES_PASSWORD_FILE: /run/secrets/db_password
secrets:
  db_password:
    file: ./secrets/db_password.txt
```
