import { Router } from 'express';
import { getCustomers } from '../controllers/customerController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, authorize('ADMIN'), getCustomers);

export default router;
