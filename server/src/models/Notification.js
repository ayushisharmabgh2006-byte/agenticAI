let NotificationModel = null;
try {
  const mongooseModule = await import('mongoose');
  const mongoose = mongooseModule.default || mongooseModule;
  const notificationSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    workflowId: { type: String, default: null },
    executionId: { type: String, default: null },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  }, { timestamps: true });

  NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
} catch {}

export const Notification = NotificationModel;
