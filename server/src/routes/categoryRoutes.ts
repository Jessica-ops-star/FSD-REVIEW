import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/menuController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, authorize('ADMIN'), createCategory);
router.put('/:id', protect, authorize('ADMIN'), updateCategory);
router.delete('/:id', protect, authorize('ADMIN'), deleteCategory);

export default router;
