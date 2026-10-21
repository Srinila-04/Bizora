import NotificationService from '../services/notification.service.js';
import ApiResponse from '../utils/apiResponse.js';

export class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const result = await NotificationService.getUserNotifications(req.user.id, req.query);
      return ApiResponse.success(res, 'Notifications retrieved', result);
    } catch (error) {
      return next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
      return ApiResponse.success(res, 'Notification marked as read', { notification });
    } catch (error) {
      return next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllAsRead(req.user.id);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return next(error);
    }
  }
}

export default NotificationController;

