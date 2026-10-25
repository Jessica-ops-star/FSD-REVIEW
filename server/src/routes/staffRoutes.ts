import { Router } from 'express';
import {
  getStaff,
  createStaff,
  toggleStaffStatus,
  resetStaffPassword,
  getStaffInvitations,
} from '../controllers/staffController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.use(authorize('ADMIN', 'RESTAURANT_ADMIN'));

router.get('/', getStaff);
router.post('/', createStaff);
router.patch('/:id/status', toggleStaffStatus);
router.post('/:id/reset-password', resetStaffPassword);
router.get('/invitations', getStaffInvitations);

export default router;
