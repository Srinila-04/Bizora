import { Router } from 'express';
import BusinessController from '../controllers/business.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createBusinessValidator,
  updateBusinessValidator,
  updateThemeValidator,
  deleteBusinessValidator
} from '../validators/business.validator.js';

const router = Router();

// Public routes
router.get('/', BusinessController.getMarketplaceBusinesses);

// Authenticated user's businesses
router.get('/my', authenticate, BusinessController.getMyBusinesses);

// Create new business
router.post('/', authenticate, validateRequest(createBusinessValidator), BusinessController.createBusiness);

// Public / general storefront details
router.get('/:id', BusinessController.getBusinessDetails);

// Management routes (Ownership checked inside controller/service)
router.patch('/:id', authenticate, validateRequest(updateBusinessValidator), BusinessController.updateBusiness);
router.delete('/:id', authenticate, validateRequest(deleteBusinessValidator), BusinessController.deleteBusiness);
router.post('/:id/toggle-publish', authenticate, BusinessController.togglePublish);
router.patch('/:id/theme', authenticate, validateRequest(updateThemeValidator), BusinessController.updateTheme);
router.get('/:id/analytics', authenticate, BusinessController.getAnalytics);

export default router;

