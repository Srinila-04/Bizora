import { Router } from 'express';
import ProductController from '../controllers/product.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createProductValidator,
  updateProductValidator
} from '../validators/product.validator.js';

const router = Router();

// Public / optional authenticated product listing
router.get('/', optionalAuth, ProductController.getProducts);

// Protected routes (business owners / admin)
router.get('/summary', authenticate, ProductController.getProductSummary);
router.get('/:id', ProductController.getProductDetails);

router.post('/', authenticate, validateRequest(createProductValidator), ProductController.createProduct);
router.post('/:id/duplicate', authenticate, ProductController.duplicateProduct);
router.patch('/:id', authenticate, validateRequest(updateProductValidator), ProductController.updateProduct);
router.delete('/:id', authenticate, ProductController.deleteProduct);

export default router;

