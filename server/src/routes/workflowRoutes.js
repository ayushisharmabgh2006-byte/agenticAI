import express from 'express';
import { body, validationResult } from 'express-validator';
import * as workflowController from '../controllers/workflowController.js';
import { optionalAuth } from './authMiddleware.js';

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', details: errors.array() });
  }
  next();
}

router.use(optionalAuth);

router.get('/dashboard', workflowController.getDashboard);
router.get('/', workflowController.listWorkflows);
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required')
  ],
  validate,
  workflowController.createWorkflow
);

router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Prompt string is required')
  ],
  validate,
  workflowController.generateWorkflow
);

router.get('/:id', workflowController.getWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.post('/:id/duplicate', workflowController.duplicateWorkflow);
router.post('/:id/execute', workflowController.executeWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

export default router;
