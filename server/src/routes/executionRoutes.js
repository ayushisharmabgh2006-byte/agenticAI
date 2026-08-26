import express from 'express';
import * as executionController from '../controllers/executionController.js';
import { optionalAuth } from './authMiddleware.js';

const router = express.Router();
router.use(optionalAuth);

router.get('/', executionController.listExecutions);
router.get('/:id', executionController.getExecution);
router.get('/:id/timeline', executionController.getTimeline);
router.post('/:id/pause', executionController.pauseExecution);
router.post('/:id/resume', executionController.resumeExecution);
router.post('/:id/cancel', executionController.cancelExecution);
router.post('/:id/retry', executionController.retryExecution);

export default router;
