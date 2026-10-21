import { Router } from 'express';
import InventoryController from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  stockAdjustmentValidator,
  updateThresholdValidator,
  createVariantValidator
} from '../validators/inventory.validator.js';

const router = Router();

// All inventory endpoints require authentication and business access
router.use(authenticate);

// 1. Get 5-card summary metrics
router.get('/summary', InventoryController.getSummary);

// 2. Get paginated inventory items & variants
router.get('/items', InventoryController.getItems);

// 3. Stock movement audit history
router.get('/movements', InventoryController.getMovements);

// 4. Adjust stock (receive, damage/loss, recount correction, return)
router.post('/adjust', validateRequest(stockAdjustmentValidator), InventoryController.adjustStock);

// 5. Update low stock threshold
router.patch('/threshold', validateRequest(updateThresholdValidator), InventoryController.updateThreshold);

// 6. Create variant
router.post(
  '/products/:productId/variants',
  validateRequest(createVariantValidator),
  InventoryController.createVariant
);

export default router;

