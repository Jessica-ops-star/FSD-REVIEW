import { Router } from 'express';
import { getPaymentByOrderId } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/:orderId', protect, getPaymentByOrderId);

export default router;
