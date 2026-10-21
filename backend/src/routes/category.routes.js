import { Router } from 'express';
import CategoryController from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createCategoryValidator,
  updateCategoryValidator
} from '../validators/product.validator.js';

const router = Router();

// Public categories
router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategoryById);

// Protected routes (business owners / admin)
router.post('/', authenticate, validateRequest(createCategoryValidator), CategoryController.createCategory);
router.patch('/:id', authenticate, validateRequest(updateCategoryValidator), CategoryController.updateCategory);
router.delete('/:id', authenticate, CategoryController.deleteCategory);

export default router;

