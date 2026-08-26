import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { optionalAuth } from './authMiddleware.js';

const router = express.Router();
router.use(optionalAuth);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

export default router;
