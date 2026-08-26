import express from 'express';
import { body, validationResult } from 'express-validator';
import * as integrationController from '../controllers/integrationController.js';
import { optionalAuth } from './authMiddleware.js';

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', details: errors.array() });
  }
  next();
}

router.get('/oauth/:provider/start', optionalAuth, integrationController.startOAuth);
router.get('/oauth/:provider/callback', integrationController.callbackOAuth);
router.get('/oauth/error', integrationController.oauthError);

router.use(optionalAuth);

router.get('/', integrationController.listIntegrations);
router.get('/status', integrationController.getStatus);
router.post(
  '/',
  [
    body('provider').notEmpty().withMessage('Provider is required')
  ],
  validate,
  integrationController.saveManual
);
router.post('/:provider/test', integrationController.testConnection);
router.post('/:provider/disconnect', integrationController.disconnect);

export default router;
