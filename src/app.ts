import { Hono } from 'hono';
import router from './router';

const app = new Hono();

// 健康检查
app.get('/', (c) => {
  return c.json({
    message: 'Web Lite API',
    version: '1.0.0',
    status: 'running',
  });
});

// 注册自动生成的路由
app.route('/', router);

// 错误处理
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      error: err.message || 'Internal Server Error',
    },
    500,
  );
});

export default app;
