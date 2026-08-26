import { memory } from '../config/db.js';
import { emitNotification } from '../config/socket.js';

export class NotificationService {
  async getNotifications(ownerId) {
    return memory.notifications.filter(n => !ownerId || n.owner === ownerId);
  }

  async markAsRead(id, ownerId) {
    const notif = memory.notifications.find(n => (n.id === id || n._id === id) && (!ownerId || n.owner === ownerId));
    if (notif) {
      notif.isRead = true;
    }
    return notif;
  }

  async markAllAsRead(ownerId) {
    memory.notifications.forEach(n => {
      if (!ownerId || n.owner === ownerId) {
        n.isRead = true;
      }
    });
    return { success: true };
  }

  async createNotification(data) {
    const notif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      _id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      owner: data.owner || 'user-operator-1',
      workflowId: data.workflowId || null,
      executionId: data.executionId || null,
      type: data.type || 'info',
      title: data.title,
      message: data.message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    memory.notifications.unshift(notif);
    emitNotification(notif.owner, notif);
    return notif;
  }
}

export const notificationService = new NotificationService();
