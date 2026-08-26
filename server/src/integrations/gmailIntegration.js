import { BaseIntegration } from './baseIntegration.js';
import { env } from '../config/env.js';

export class GmailIntegration extends BaseIntegration {
  constructor() {
    super('Gmail', 'gmail');
  }

  getAuthUrl(state = '') {
    const clientId = env.integrations.gmail.clientId || 'demo_gmail_client_id';
    const redirectUri = encodeURIComponent(env.integrations.gmail.redirectUri);
    const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
  }

  async exchangeCode(code) {
    return {
      accessToken: `mock_gmail_access_${Date.now()}`,
      refreshToken: `mock_gmail_refresh_${Date.now()}`,
      expiresIn: 3600,
      email: 'operator@agentflow.io',
      scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly']
    };
  }

  async testConnection(credentials = {}) {
    return {
      ok: true,
      provider: 'gmail',
      email: credentials.email || 'ops.agentflow@gmail.com',
      latencyMs: 142,
      scopesValid: true
    };
  }

  async executeAction(actionName, params = {}, credentials = {}) {
    if (actionName === 'send_email' || actionName === 'send') {
      const { to, subject, body } = params;
      if (!to) throw new Error('MISSING_REQUIRED_FIELD: "to" address is required');
      return {
        success: true,
        messageId: `msg_${Math.random().toString(36).slice(2, 11)}`,
        to,
        subject: subject || '(No Subject)',
        snippet: (body || '').slice(0, 80),
        status: 'SENT',
        timestamp: new Date().toISOString()
      };
    }

    if (actionName === 'read_emails' || actionName === 'search') {
      const query = params.query || 'is:unread';
      return {
        success: true,
        query,
        count: 2,
        messages: [
          {
            id: 'msg_98124',
            from: 'billing@vendor-corp.com',
            subject: 'Invoice #88219 for Services Rendered',
            snippet: 'Please find attached invoice for payment due within 30 days.'
          },
          {
            id: 'msg_98125',
            from: 'vip-client@enterprise.com',
            subject: 'Urgent: API Gateway latency spike reported',
            snippet: 'We noticed a 400ms increase on US-East webhook ingress.'
          }
        ]
      };
    }

    return { success: true, action: actionName, echo: params };
  }
}

export const gmailIntegration = new GmailIntegration();
