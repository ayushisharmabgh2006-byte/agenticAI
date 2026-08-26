import crypto from 'crypto';
import { env } from '../config/env.js';
import { memory } from '../config/db.js';
import { gmailIntegration } from '../integrations/gmailIntegration.js';
import { slackIntegration } from '../integrations/slackIntegration.js';
import { discordIntegration } from '../integrations/discordIntegration.js';
import { googleSheetsIntegration } from '../integrations/googleSheetsIntegration.js';

const ALGORITHM = 'aes-256-gcm';

export function encryptCredentials(plainText) {
  if (!plainText) return '';
  const key = crypto.createHash('sha256').update(String(env.credentialEncryptionKey)).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(typeof plainText === 'string' ? plainText : JSON.stringify(plainText), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

export function decryptCredentials(encryptedToken) {
  if (!encryptedToken) return null;
  if (!encryptedToken.includes(':')) return { token: encryptedToken };
  try {
    const [ivHex, tagHex, encryptedHex] = encryptedToken.split(':');
    const key = crypto.createHash('sha256').update(String(env.credentialEncryptionKey)).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    try {
      return JSON.parse(decrypted);
    } catch {
      return { token: decrypted };
    }
  } catch (err) {
    return { token: encryptedToken };
  }
}

export class IntegrationService {
  getIntegrationHandler(provider) {
    switch (provider) {
      case 'gmail': return gmailIntegration;
      case 'slack': return slackIntegration;
      case 'discord': return discordIntegration;
      case 'google-sheets': return googleSheetsIntegration;
      default: return null;
    }
  }

  async getUserIntegrations(ownerId) {
    return memory.integrations.filter(item => item.owner === ownerId);
  }

  async getIntegrationStatus(ownerId) {
    const providers = ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'];
    const userIntegrations = memory.integrations.filter(item => item.owner === ownerId);

    return providers.map(provider => {
      const existing = userIntegrations.find(item => item.provider === provider);
      const isConnected = existing ? Boolean(existing.isConnected) : (
        provider === 'openrouter' ? Boolean(env.openRouterApiKey) :
        provider === 'gemini' ? Boolean(env.geminiApiKey) : false
      );

      return {
        provider,
        name: provider === 'google-sheets' ? 'Google Sheets' : provider.charAt(0).toUpperCase() + provider.slice(1),
        isConnected,
        scopes: existing ? existing.scopes : [],
        metadata: existing ? existing.metadata : {},
        updatedAt: existing ? existing.updatedAt : new Date().toISOString()
      };
    });
  }

  getOAuthUrl(provider, state) {
    const handler = this.getIntegrationHandler(provider);
    if (!handler) throw new Error(`UNKNOWN_PROVIDER: Provider ${provider} does not support OAuth`);
    return handler.getAuthUrl(state);
  }

  async handleOAuthCallback(provider, code, ownerId) {
    const handler = this.getIntegrationHandler(provider);
    if (!handler) throw new Error(`UNKNOWN_PROVIDER: Provider ${provider} does not exist`);

    const result = await handler.exchangeCode(code);
    const encryptedTokens = encryptCredentials(result);

    const existingIndex = memory.integrations.findIndex(i => i.owner === ownerId && i.provider === provider);
    const integrationRecord = {
      id: `int-${provider}-${Date.now()}`,
      _id: `int-${provider}-${Date.now()}`,
      owner: ownerId,
      provider,
      isConnected: true,
      scopes: result.scopes || [],
      encryptedTokens,
      metadata: { ...result },
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      memory.integrations[existingIndex] = { ...memory.integrations[existingIndex], ...integrationRecord };
    } else {
      memory.integrations.push(integrationRecord);
    }

    return integrationRecord;
  }

  async saveManualCredentials(ownerId, { provider, credentials, scopes, metadata }) {
    const encryptedTokens = encryptCredentials(credentials);
    const existingIndex = memory.integrations.findIndex(i => i.owner === ownerId && i.provider === provider);

    const integrationRecord = {
      id: `int-${provider}-${Date.now()}`,
      _id: `int-${provider}-${Date.now()}`,
      owner: ownerId,
      provider,
      isConnected: true,
      scopes: scopes || [],
      encryptedTokens,
      metadata: metadata || {},
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      memory.integrations[existingIndex] = { ...memory.integrations[existingIndex], ...integrationRecord };
    } else {
      memory.integrations.push(integrationRecord);
    }

    return integrationRecord;
  }

  async disconnectIntegration(ownerId, provider) {
    const existing = memory.integrations.find(i => i.owner === ownerId && i.provider === provider);
    if (existing) {
      existing.isConnected = false;
      existing.encryptedTokens = '';
      existing.updatedAt = new Date().toISOString();
    }
    return { success: true, provider, isConnected: false };
  }

  async testIntegration(ownerId, provider) {
    const integration = memory.integrations.find(i => i.owner === ownerId && i.provider === provider);
    if (!integration || !integration.isConnected) {
      throw new Error(`INTEGRATION_NOT_CONNECTED: Provider "${provider}" is not connected.`);
    }

    const handler = this.getIntegrationHandler(provider);
    if (!handler) {
      return { ok: true, provider, message: 'Provider test succeeded' };
    }

    const credentials = decryptCredentials(integration.encryptedTokens) || {};
    return handler.testConnection(credentials);
  }

  async executeIntegrationAction(ownerId, provider, action, params = {}) {
    const integration = memory.integrations.find(i => i.owner === ownerId && i.provider === provider);
    if (!integration || !integration.isConnected) {
      throw new Error(`INTEGRATION_NOT_CONNECTED: Cannot execute action on disconnected integration "${provider}".`);
    }

    const handler = this.getIntegrationHandler(provider);
    if (!handler) {
      throw new Error(`UNSUPPORTED_PROVIDER: No handler for provider "${provider}".`);
    }

    const credentials = decryptCredentials(integration.encryptedTokens) || {};
    return handler.executeAction(action, params, credentials);
  }
}

export const integrationService = new IntegrationService();
