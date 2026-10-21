import { Router } from 'express';
import ReviewController from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createReviewValidator } from '../validators/review.validator.js';

const router = Router();

// Public: view product reviews
router.get('/product/:productId', ReviewController.getProductReviews);

// Protected: create/delete reviews
router.post('/', authenticate, validateRequest(createReviewValidator), ReviewController.createReview);
router.delete('/:id', authenticate, ReviewController.deleteReview);

export default router;

