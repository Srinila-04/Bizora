import { Router } from 'express';
import OrderController from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createOrderValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
  dispatchOrderValidator,
  updateDeliveryStatusValidator,
  codCollectionValidator
} from '../validators/order.validator.js';

const router = Router();

router.use(authenticate);

// Customer orders
router.post('/', validateRequest(createOrderValidator), OrderController.createOrder);
router.get('/', OrderController.getCustomerOrders);
router.post('/:id/cancel', validateRequest(cancelOrderValidator), OrderController.cancelOrder);

// Business orders & COD reconciliation
router.get('/business/:businessId', OrderController.getBusinessOrders);
router.get('/business/:businessId/cod-reconciliation', OrderController.getCodReconciliation);

// Order status & fulfillment operations
router.get('/:id', OrderController.getOrderById);
router.patch('/:id/status', validateRequest(updateOrderStatusValidator), OrderController.updateOrderStatus);
router.patch('/:id/dispatch', validateRequest(dispatchOrderValidator), OrderController.dispatchOrder);
router.patch('/:id/delivery-status', validateRequest(updateDeliveryStatusValidator), OrderController.updateDeliveryStatus);
router.post('/:id/cod-collection', validateRequest(codCollectionValidator), OrderController.recordCodCollection);

export default router;
