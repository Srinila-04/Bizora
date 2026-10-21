import { Notification } from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';
import { parsePagination, formatPaginationMeta } from '../utils/pagination.js';

export class NotificationService {
  static async getUserNotifications(userId, query = {}) {
    const { page, limit, offset } = parsePagination(query, 20, 100);
    const { unreadOnly = false } = query;

    const where = { userId };
    if (unreadOnly === 'true' || unreadOnly === true) {
      where.isRead = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const unreadCount = await Notification.count({
      where: { userId, isRead: false }
    });

    return {
      notifications: rows,
      unreadCount,
      pagination: formatPaginationMeta(count, page, limit)
    };
  }

  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  static async markAllAsRead(userId) {
    await Notification.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: { userId, isRead: false }
      }
    );

    return { message: 'All notifications marked as read' };
  }
}

export default NotificationService;

