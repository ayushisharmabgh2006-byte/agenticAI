import { notificationService } from '../services/notificationService.js';

export async function getNotifications(req, res, next) {
  try {
    const ownerId = req.user?.id || 'user-operator-1';
    const notifications = await notificationService.getNotifications(ownerId);
    res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    const ownerId = req.user?.id || 'user-operator-1';
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, ownerId);
    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req, res, next) {
  try {
    const ownerId = req.user?.id || 'user-operator-1';
    const result = await notificationService.markAllAsRead(ownerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
