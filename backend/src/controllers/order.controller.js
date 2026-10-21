import OrderService from '../services/order.service.js';
import ApiResponse from '../utils/apiResponse.js';
import { emitToBusiness, emitToUser } from '../sockets/index.js';

export class OrderController {
  static async createOrder(req, res, next) {
    try {
      const order = await OrderService.createOrder(req.user.id, req.body);

      // Real-time notification for merchant business:
      emitToBusiness(order.businessId, 'order:new', { order });
      emitToBusiness(order.businessId, 'notification:new', {
        type: 'new_order',
        title: 'New Order Received! 🛍️',
        message: `Order #${order.orderNumber} for ₹${Number(order.totalAmount).toLocaleString('en-IN')}`,
        orderId: order.id,
        businessId: order.businessId,
        timestamp: new Date().toISOString()
      });

      // Real-time confirmation for customer:
      emitToUser(req.user.id, 'notification:new', {
        type: 'order_confirmed',
        title: 'Order Confirmed! 🎉',
        message: `Your order #${order.orderNumber} was placed successfully.`,
        orderId: order.id,
        timestamp: new Date().toISOString()
      });

      return ApiResponse.created(res, 'Order placed successfully', { order });
    } catch (error) {
      return next(error);
    }
  }

  static async getOrderById(req, res, next) {
    try {
      const order = await OrderService.getOrderById(req.params.id, req.user.id, req.user.role);
      return ApiResponse.success(res, 'Order details retrieved', { order });
    } catch (error) {
      return next(error);
    }
  }

  static async getCustomerOrders(req, res, next) {
    try {
      const result = await OrderService.getCustomerOrders(req.user.id, req.query);
      return ApiResponse.success(res, 'Customer orders retrieved', result);
    } catch (error) {
      return next(error);
    }
  }

  static async getBusinessOrders(req, res, next) {
    try {
      const result = await OrderService.getBusinessOrders(
        req.params.businessId,
        req.user.id,
        req.user.role,
        req.query
      );
      return ApiResponse.success(res, 'Business orders retrieved', result);
    } catch (error) {
      return next(error);
    }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const { status, notes, ...payload } = req.body;
      const order = await OrderService.updateOrderStatus(
        req.params.id,
        req.user.id,
        req.user.role,
        status,
        notes,
        payload
      );

      // Real-time update for customer:
      emitToUser(order.userId, 'order:updated', { order });
      emitToUser(order.userId, 'notification:new', {
        type: 'order_status',
        title: 'Order Status Update 📦',
        message: `Order #${order.orderNumber} is now ${String(status).replace(/_/g, ' ').toUpperCase()}`,
        orderId: order.id,
        status,
        timestamp: new Date().toISOString()
      });

      return ApiResponse.success(res, 'Order status updated successfully', { order });
    } catch (error) {
      return next(error);
    }
  }

  static async dispatchOrder(req, res, next) {
    try {
      const order = await OrderService.dispatchOrder(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body
      );

      emitToUser(order.userId, 'order:updated', { order });
      emitToUser(order.userId, 'notification:new', {
        type: 'order_status',
        title: 'Order Dispatched! 🚚',
        message: `Order #${order.orderNumber} is on its way with courier ${order.courierName || 'Expedited'}`,
        orderId: order.id,
        status: 'shipped',
        timestamp: new Date().toISOString()
      });

      return ApiResponse.success(res, 'Order dispatched successfully with courier tracking', { order });
    } catch (error) {
      return next(error);
    }
  }

  static async updateDeliveryStatus(req, res, next) {
    try {
      const { status, notes, ...payload } = req.body;
      const order = await OrderService.updateOrderStatus(
        req.params.id,
        req.user.id,
        req.user.role,
        status,
        notes,
        payload
      );

      emitToUser(order.userId, 'order:updated', { order });
      emitToUser(order.userId, 'notification:new', {
        type: 'order_status',
        title: status === 'delivered' ? 'Order Delivered! 🎉' : 'Delivery Update 📦',
        message: `Order #${order.orderNumber} delivery status: ${String(status).replace(/_/g, ' ').toUpperCase()}`,
        orderId: order.id,
        status,
        timestamp: new Date().toISOString()
      });

      return ApiResponse.success(res, `Delivery status updated to ${status}`, { order });
    } catch (error) {
      return next(error);
    }
  }

  static async recordCodCollection(req, res, next) {
    try {
      const result = await OrderService.recordCodCollection(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body
      );
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      return next(error);
    }
  }

  static async getCodReconciliation(req, res, next) {
    try {
      const result = await OrderService.getCodReconciliation(
        req.params.businessId,
        req.user.id,
        req.user.role,
        req.query
      );
      return ApiResponse.success(res, 'COD reconciliation report retrieved', result);
    } catch (error) {
      return next(error);
    }
  }

  static async cancelOrder(req, res, next) {
    try {
      const { cancelReason } = req.body;
      const order = await OrderService.cancelOrder(req.params.id, req.user.id, cancelReason);

      emitToBusiness(order.businessId, 'order:updated', { order });
      emitToBusiness(order.businessId, 'notification:new', {
        type: 'order_cancelled',
        title: 'Order Cancelled ⚠️',
        message: `Order #${order.orderNumber} was cancelled by customer.`,
        orderId: order.id,
        timestamp: new Date().toISOString()
      });

      return ApiResponse.success(res, 'Order cancelled successfully', { order });
    } catch (error) {
      return next(error);
    }
  }
}

export default OrderController;

