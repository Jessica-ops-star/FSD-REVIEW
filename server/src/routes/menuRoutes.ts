import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
} from '../controllers/menuController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Category routes
router.get('/categories', getCategories);
router.post('/categories', protect, authorize('ADMIN'), createCategory);
router.put('/categories/:id', protect, authorize('ADMIN'), updateCategory);
router.delete('/categories/:id', protect, authorize('ADMIN'), deleteCategory);

// Menu Item routes
router.get('/', getMenuItems);
router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItemById);
router.get('/:id', getMenuItemById);
router.post('/', protect, authorize('ADMIN'), createMenuItem);
router.post('/items', protect, authorize('ADMIN'), createMenuItem);
router.put('/items/:id', protect, authorize('ADMIN'), updateMenuItem);
router.put('/:id', protect, authorize('ADMIN'), updateMenuItem);
router.patch('/items/:id/availability', protect, authorize('ADMIN', 'KITCHEN'), toggleAvailability);
router.patch('/:id/availability', protect, authorize('ADMIN', 'KITCHEN'), toggleAvailability);
router.delete('/items/:id', protect, authorize('ADMIN'), deleteMenuItem);
router.delete('/:id', protect, authorize('ADMIN'), deleteMenuItem);

export default router;
