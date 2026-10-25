import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/', authorize('ADMIN', 'KITCHEN', 'DELIVERY'), getAllOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorize('ADMIN', 'KITCHEN', 'DELIVERY'), updateOrderStatus);
router.post('/:id/cancel', cancelOrder);

export default router;
