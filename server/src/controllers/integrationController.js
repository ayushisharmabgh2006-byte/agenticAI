import { integrationService } from '../services/integrationService.js';
import { env } from '../config/env.js';

export async function listIntegrations(req, res, next) {
  try {
    const ownerId = req.user?.id || 'user-operator-1';
    const integrations = await integrationService.getUserIntegrations(ownerId);
    res.json({ success: true, integrations });
  } catch (error) {
    next(error);
  }
}

export async function getStatus(req, res, next) {
  try {
    const ownerId = req.user?.id || 'user-operator-1';
    const status = await integrationService.getIntegrationStatus(ownerId);
    res.json({ success: true, integrations: status });
  } catch (error) {
    next(error);
  }
}

export async function startOAuth(req, res, next) {
  try {
    const { provider } = req.params;
    const state = req.query.state || Buffer.from(JSON.stringify({ userId: req.user?.id || 'user-operator-1' })).toString('base64');
    const authUrl = integrationService.getOAuthUrl(provider, state);
    res.json({ success: true, authUrl });
  } catch (error) {
    next(error);
  }
}

export async function callbackOAuth(req, res, next) {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;

    let ownerId = req.user?.id || 'user-operator-1';
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        if (decoded.userId) ownerId = decoded.userId;
      } catch {}
    }

    const integration = await integrationService.handleOAuthCallback(provider, code || 'demo_code_authorized', ownerId);
    res.redirect(`${env.clientUrl}/integrations?connected=${provider}`);
  } catch (error) {
    res.redirect(`${env.clientUrl}/integrations?error=${encodeURIComponent(error.message)}`);
  }
}

export async function oauthError(req, res, next) {
  res.json({
    error: 'OAUTH_ERROR',
    message: req.query.message || 'OAuth authorization flow encountered an error.'
  });
}

export async function saveManual(req, res, next) {
  try {
    const ownerId = req.user?.id || 'user-operator-1';
    const { provider, credentials, scopes, metadata } = req.body;
    const result = await integrationService.saveManualCredentials(ownerId, { provider, credentials, scopes, metadata });
    res.status(201).json({ success: true, integration: result });
  } catch (error) {
    next(error);
  }
}

export async function testConnection(req, res, next) {
  try {
    const ownerId = req.user?.id || 'user-operator-1';
    const { provider } = req.params;
    const result = await integrationService.testIntegration(ownerId, provider);
    res.json({ success: true, result });
  } catch (error) {
    if (error.message.includes('INTEGRATION_NOT_CONNECTED')) {
      return res.status(400).json({ error: error.message, code: 'INTEGRATION_NOT_CONNECTED' });
    }
    next(error);
  }
}

export async function disconnect(req, res, next) {
  try {
    const ownerId = req.user?.id || 'user-operator-1';
    const { provider } = req.params;
    const result = await integrationService.disconnectIntegration(ownerId, provider);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
