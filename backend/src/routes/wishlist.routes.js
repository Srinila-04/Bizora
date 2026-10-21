import { Router } from 'express';
import WishlistController from '../controllers/wishlist.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { addToWishlistValidator } from '../validators/review.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', WishlistController.getWishlist);
router.post('/', validateRequest(addToWishlistValidator), WishlistController.addToWishlist);
router.delete('/:productId', WishlistController.removeFromWishlist);

export default router;

