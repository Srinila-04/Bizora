import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import businessRoutes from './business.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import uploadRoutes from './upload.routes.js';
import reviewRoutes from './review.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import chatRoutes from './chat.routes.js';
import notificationRoutes from './notification.routes.js';
import addressRoutes from './address.routes.js';
import inventoryRoutes from './inventory.routes.js';
import sequelize from '../config/database.js';

const router = Router();

// Health Check Endpoint
router.get('/health', async (req, res) => {
  let dbStatus = 'connected';
  try {
    await sequelize.authenticate();
  } catch (err) {
    dbStatus = 'disconnected';
  }

  return res.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus
    }
  });
});

// API v1 Routes
const v1 = Router();
v1.use('/auth', authRoutes);
v1.use('/users', userRoutes);
v1.use('/businesses', businessRoutes);
v1.use('/products', productRoutes);
v1.use('/categories', categoryRoutes);
v1.use('/orders', orderRoutes);
v1.use('/payments', paymentRoutes);
v1.use('/uploads', uploadRoutes);
v1.use('/reviews', reviewRoutes);
v1.use('/wishlist', wishlistRoutes);
v1.use('/chat', chatRoutes);
v1.use('/notifications', notificationRoutes);
v1.use('/addresses', addressRoutes);
v1.use('/inventory', inventoryRoutes);

router.use('/api/v1', v1);

export default router;

