import { Router } from 'express';
import {
  getAvailablePersonnel,
  assignDeliveryPersonnel,
  acceptDeliveryOrder,
  getMyAssignments,
  updateDeliveryStatus,
} from '../controllers/deliveryController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

// Admin routes: allocate / assign delivery personnel
router.get('/available-personnel', authorize('ADMIN'), getAvailablePersonnel);
router.post('/assign', authorize('ADMIN'), assignDeliveryPersonnel);
router.post('/allocate', authorize('ADMIN'), assignDeliveryPersonnel);

// Delivery rider & Admin routes: view assignments, accept orders, update delivery status
router.get('/my-assignments', authorize('DELIVERY', 'ADMIN'), getMyAssignments);
router.post('/:id/accept', authorize('DELIVERY', 'ADMIN'), acceptDeliveryOrder);
router.patch('/:id/accept', authorize('DELIVERY', 'ADMIN'), acceptDeliveryOrder);
router.patch('/:id/status', authorize('DELIVERY', 'ADMIN'), updateDeliveryStatus);

export default router;
