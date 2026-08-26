import { BaseIntegration } from './baseIntegration.js';
import { env } from '../config/env.js';

export class SlackIntegration extends BaseIntegration {
  constructor() {
    super('Slack', 'slack');
  }

  getAuthUrl(state = '') {
    const clientId = env.integrations.slack.clientId || 'demo_slack_client_id';
    const redirectUri = encodeURIComponent(env.integrations.slack.redirectUri);
    const scope = encodeURIComponent('chat:write,channels:read,incoming-webhook');
    return `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
  }

  async exchangeCode(code) {
    return {
      accessToken: `xoxb-mock-slack-${Date.now()}`,
      workspace: 'Agentflow HQ',
      channel: '#ops-alerts',
      scopes: ['chat:write', 'channels:read', 'incoming-webhook']
    };
  }

  async testConnection(credentials = {}) {
    return {
      ok: true,
      provider: 'slack',
      workspace: credentials.workspace || 'Agentflow HQ',
      channel: credentials.channel || '#ops-alerts',
      latencyMs: 95
    };
  }

  async executeAction(actionName, params = {}, credentials = {}) {
    if (actionName === 'post_message' || actionName === 'send') {
      const { channel = '#ops-alerts', message, blocks } = params;
      if (!message && !blocks) {
        throw new Error('MISSING_REQUIRED_FIELD: "message" text is required');
      }

      return {
        success: true,
        channel,
        ts: `${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 1000000)}`,
        text: message,
        status: 'DELIVERED',
        timestamp: new Date().toISOString()
      };
    }

    return { success: true, action: actionName, echo: params };
  }
}

export const slackIntegration = new SlackIntegration();
