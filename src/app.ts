import { Hono } from 'hono';
import router from './router';
import { responseMiddleware } from './middlewares/response';
import { ResponseCode } from './utils/response';

const app = new Hono();

// 应用响应中间件
app.use('*', responseMiddleware);

// 健康检查
app.get('/', (c) => {
  return c.apiSuccess(
    {
      name: 'Web Lite API',
      version: '1.0.0',
      status: 'running',
    },
    'API is running',
  );
});

// 注册自动生成的路由
app.route('/', router);

// 404 处理
app.notFound((c) => {
  return c.apiNotFound('Resource not found');
});

// 错误处理
app.onError((err, c) => {
  console.error('Error:', err);
  // 判断是否是验证错误
  if (err.message.includes('Validation')) {
    return c.apiValidationError(err.message);
  }
  return c.apiError(err.message || 'Internal server error', ResponseCode.INTERNAL_ERROR);
});

export default app;
