/**
 * 路由注册入口
 *
 * 此文件由代码生成器自动维护
 * 请勿手动修改 AUTO-REGISTER 区域
 */

import { Hono } from 'hono';

const router = new Hono();

// ========== AUTO-REGISTER START ==========
import { authRoute } from './modules/auth';
import { categoryRoute } from './modules/category';
import { orderRoute } from './modules/order';
import { productRoute } from './modules/product';
import { userRoute } from './modules/user';

// 注册路由
router.route('/auths', authRoute);
router.route('/categories', categoryRoute);
router.route('/orders', orderRoute);
router.route('/products', productRoute);
router.route('/users', userRoute);
// ========== AUTO-REGISTER END ==========

export default router;
