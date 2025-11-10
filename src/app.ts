import { Hono } from 'hono';
import { userRoute } from './modules/user';
import { productRoute } from './modules/product';
import { orderRoute } from './modules/order';

const app = new Hono();

// 健康检查
app.get('/', (c) => {
  return c.json({ 
    message: 'Web Lite API',
    version: '1.0.0',
    status: 'running' 
  });
});

// 注册路由
app.route('/user', userRoute);
app.route('/product', productRoute);
app.route('/order', orderRoute);

// 错误处理
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ 
    error: err.message || 'Internal Server Error' 
  }, 500);
});

export default app;
