import { BaseIntegration } from './baseIntegration.js';
import { env } from '../config/env.js';

export class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('Discord', 'discord');
  }

  getAuthUrl(state = '') {
    const clientId = env.integrations.discord.clientId || 'demo_discord_client_id';
    const redirectUri = encodeURIComponent(env.integrations.discord.redirectUri);
    const scope = encodeURIComponent('bot webhook.incoming');
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=2048&scope=${scope}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;
  }

  async exchangeCode(code) {
    return {
      accessToken: `mock_discord_token_${Date.now()}`,
      guildName: 'Automation Guild',
      channel: '#general',
      scopes: ['bot', 'webhook.incoming']
    };
  }

  async testConnection(credentials = {}) {
    return {
      ok: true,
      provider: 'discord',
      guild: credentials.guildName || 'Automation Guild',
      channel: credentials.channel || '#general',
      latencyMs: 110
    };
  }

  async executeAction(actionName, params = {}, credentials = {}) {
    const { channel = '#general', message = '', embed = null } = params;
    return {
      success: true,
      messageId: `dsc_${Math.random().toString(36).slice(2, 11)}`,
      channel,
      content: message,
      embed: embed || { title: 'Agentflow Notification', description: message, color: 0xc7f36b },
      status: 'DELIVERED',
      timestamp: new Date().toISOString()
    };
  }
}

export const discordIntegration = new DiscordIntegration();
