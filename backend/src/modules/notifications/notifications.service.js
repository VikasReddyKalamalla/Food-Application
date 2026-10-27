import crypto from 'node:crypto';
import { getIO } from '../../infrastructure/realtime/socket.js';
import { REALTIME_EVENTS } from '../../common/constants/events.js';

/**
 * Notifications Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose Notification Schema integration
 */
export class NotificationsService {
  constructor() {
    this.notifications = new Map();
  }

  async getUserNotifications(userId) {
    const list = [];
    for (const notif of this.notifications.values()) {
      if (notif.userId === userId) {
        list.push(notif);
      }
    }
    return list;
  }

  async sendNotification(userId, title, message) {
    const id = crypto.randomUUID();
    const notification = {
      id,
      userId,
      title,
      message,
      isRead: false,
      createdAt: new Date(),
    };

    this.notifications.set(id, notification);

    // Dispatch real-time notification to user's private socket room
    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit(REALTIME_EVENTS.NOTIFICATION_RECEIVED, notification);
    }

    return notification;
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
