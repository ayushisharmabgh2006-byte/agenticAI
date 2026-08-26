import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from './env.js';

// Pre-seeded Memory Database for Zero-Config Local Execution
export const memory = {
  users: [],
  workflows: [],
  executions: [],
  executionLogs: [],
  integrations: [],
  notifications: [],
  agentMemory: []
};

// Seed initial memory store
export async function seedMemoryDatabase() {
  if (memory.users.length > 0) return;

  const passwordHash = await bcrypt.hash('password123', 12);
  const operatorUser = {
    id: 'user-operator-1',
    _id: 'user-operator-1',
    name: 'Alex Rivera',
    email: 'operator@agentflow.io',
    password: passwordHash,
    role: 'operator',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  const adminUser = {
    id: 'user-admin-1',
    _id: 'user-admin-1',
    name: 'Sarah Connor',
    email: 'admin@agentflow.io',
    password: passwordHash,
    role: 'admin',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  memory.users.push(operatorUser, adminUser);

  // Pre-seeded Integrations
  const defaultIntegrations = [
    {
      id: 'int-gmail',
      _id: 'int-gmail',
      owner: operatorUser.id,
      provider: 'gmail',
      isConnected: true,
      scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
      encryptedTokens: 'enc_mock_gmail_token_aes256',
      metadata: { email: 'ops.agentflow@gmail.com', rateLimitRemaining: 980 },
      updatedAt: new Date().toISOString()
    },
    {
      id: 'int-slack',
      _id: 'int-slack',
      owner: operatorUser.id,
      provider: 'slack',
      isConnected: true,
      scopes: ['chat:write', 'channels:read'],
      encryptedTokens: 'enc_mock_slack_token_aes256',
      metadata: { workspace: 'Agentflow HQ', channel: '#ops-alerts' },
      updatedAt: new Date().toISOString()
    },
    {
      id: 'int-discord',
      _id: 'int-discord',
      owner: operatorUser.id,
      provider: 'discord',
      isConnected: true,
      scopes: ['bot', 'webhook.incoming'],
      encryptedTokens: 'enc_mock_discord_token_aes256',
      metadata: { guildName: 'Automation Guild', channel: '#general' },
      updatedAt: new Date().toISOString()
    },
    {
      id: 'int-sheets',
      _id: 'int-sheets',
      owner: operatorUser.id,
      provider: 'google-sheets',
      isConnected: true,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      encryptedTokens: 'enc_mock_sheets_token_aes256',
      metadata: { spreadsheetName: 'Operations Lead Ledger' },
      updatedAt: new Date().toISOString()
    },
    {
      id: 'int-openrouter',
      _id: 'int-openrouter',
      owner: operatorUser.id,
      provider: 'openrouter',
      isConnected: Boolean(env.openRouterApiKey),
      scopes: ['model.generate'],
      encryptedTokens: env.openRouterApiKey ? 'enc_live_openrouter_key' : '',
      metadata: { model: 'anthropic/claude-3.5-sonnet' },
      updatedAt: new Date().toISOString()
    },
    {
      id: 'int-gemini',
      _id: 'int-gemini',
      owner: operatorUser.id,
      provider: 'gemini',
      isConnected: Boolean(env.geminiApiKey),
      scopes: ['gemini.generateContent'],
      encryptedTokens: env.geminiApiKey ? 'enc_live_gemini_key' : '',
      metadata: { model: 'gemini-1.5-pro' },
      updatedAt: new Date().toISOString()
    }
  ];
  memory.integrations.push(...defaultIntegrations);

  // Pre-seeded Workflows
  const defaultWorkflows = [
    {
      id: 'wf-invoice-triage',
      _id: 'wf-invoice-triage',
      name: 'Invoice Triage & Slack Dispatch',
      description: 'Parses incoming vendor invoices with AI, verifies billing totals, and dispatches an approval request to Slack.',
      owner: operatorUser.id,
      status: 'active',
      version: 2,
      tags: ['finance', 'billing', 'slack', 'ai'],
      triggerConfig: { type: 'webhook', event: 'invoice.received', endpoint: '/webhook/invoices' },
      nodes: [
        {
          id: 'node-trigger',
          type: 'trigger',
          position: { x: 100, y: 150 },
          data: { label: 'Incoming Invoice Webhook', type: 'trigger', provider: 'webhook', config: { event: 'invoice.received' } }
        },
        {
          id: 'node-ai-parse',
          type: 'ai',
          position: { x: 420, y: 150 },
          data: {
            label: 'AI Line-Item Extractor',
            type: 'ai',
            provider: 'openrouter',
            config: { instruction: 'Extract vendor name, invoice total, tax percentage, and line items into JSON.', model: 'anthropic/claude-3.5-sonnet' }
          }
        },
        {
          id: 'node-sheets',
          type: 'integration',
          position: { x: 740, y: 80 },
          data: {
            label: 'Append to Finance Ledger',
            type: 'integration',
            provider: 'google-sheets',
            config: { spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', range: 'Invoices!A:F', action: 'append_row' }
          }
        },
        {
          id: 'node-slack',
          type: 'integration',
          position: { x: 740, y: 240 },
          data: {
            label: 'Notify Finance Channel',
            type: 'integration',
            provider: 'slack',
            config: { channel: '#finance-ops', message: '💳 *New Invoice Processed*\nVendor: {{vendor}}\nAmount: ${{amount}}', action: 'post_message' }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'node-trigger', target: 'node-ai-parse', animated: true },
        { id: 'e2', source: 'node-ai-parse', target: 'node-sheets', animated: true },
        { id: 'e3', source: 'node-ai-parse', target: 'node-slack', animated: true }
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'wf-support-escalation',
      _id: 'wf-support-escalation',
      name: 'VIP Customer Support Escalation',
      description: 'Detects high-priority customer issues in Gmail, evaluates sentiment, and posts alert cards to Discord.',
      owner: operatorUser.id,
      status: 'active',
      version: 1,
      tags: ['support', 'gmail', 'discord', 'sentiment'],
      triggerConfig: { type: 'cron', schedule: '*/10 * * * *' },
      nodes: [
        {
          id: 'node-trig-mail',
          type: 'trigger',
          position: { x: 100, y: 150 },
          data: { label: 'Poll Support Inbox', type: 'trigger', provider: 'gmail', config: { query: 'label:support is:unread' } }
        },
        {
          id: 'node-ai-sentiment',
          type: 'ai',
          position: { x: 420, y: 150 },
          data: {
            label: 'Sentiment & Urgency Classifier',
            type: 'ai',
            provider: 'gemini',
            config: { instruction: 'Score customer sentiment from 1-10 and flag critical SLA breaches.', model: 'gemini-1.5-pro' }
          }
        },
        {
          id: 'node-discord-alert',
          type: 'integration',
          position: { x: 740, y: 150 },
          data: {
            label: 'Dispatch Discord Alert',
            type: 'integration',
            provider: 'discord',
            config: { channel: '#tier3-escalations', message: '🚨 **Critical Support Alert**\nUser: {{user}}\nUrgency: High', action: 'post_embed' }
          }
        }
      ],
      edges: [
        { id: 'e10', source: 'node-trig-mail', target: 'node-ai-sentiment', animated: true },
        { id: 'e11', source: 'node-ai-sentiment', target: 'node-discord-alert', animated: true }
      ],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  memory.workflows.push(...defaultWorkflows);

  // Pre-seeded Executions & Logs
  const sampleExec = {
    id: 'exec-demo-101',
    _id: 'exec-demo-101',
    workflowId: 'wf-invoice-triage',
    workflowSnapshot: structuredClone(defaultWorkflows[0]),
    status: 'COMPLETED',
    currentNode: null,
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() - 3594000).toISOString(),
    duration: 6000,
    inputs: { invoiceNumber: 'INV-88219', vendor: 'Acme Cloud Hosting', total: 4299.50 },
    outputs: { invoiceNumber: 'INV-88219', vendor: 'Acme Cloud Hosting', status: 'approved', sheetRow: 142, slackMessageTs: '1724560000.12' },
    error: null,
    retryCount: 0,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  };
  memory.executions.push(sampleExec);

  const sampleLogs = [
    {
      id: 'log-1',
      _id: 'log-1',
      executionId: sampleExec.id,
      workflowId: sampleExec.workflowId,
      nodeId: 'node-trigger',
      agent: 'planner',
      level: 'info',
      message: 'Constructed execution DAG: 4 nodes, 3 dependencies resolved. Confidence score: 0.98.',
      metadata: { dagOrder: ['node-trigger', 'node-ai-parse', 'node-sheets', 'node-slack'], confidenceScore: 0.98 },
      timestamp: new Date(Date.now() - 3599000).toISOString()
    },
    {
      id: 'log-2',
      _id: 'log-2',
      executionId: sampleExec.id,
      workflowId: sampleExec.workflowId,
      nodeId: 'node-trigger',
      agent: 'execution',
      level: 'success',
      message: 'Trigger payload received and parsed from Webhook ingest.',
      metadata: { payloadSize: '2.4KB' },
      timestamp: new Date(Date.now() - 3598000).toISOString()
    },
    {
      id: 'log-3',
      _id: 'log-3',
      executionId: sampleExec.id,
      workflowId: sampleExec.workflowId,
      nodeId: 'node-ai-parse',
      agent: 'execution',
      level: 'success',
      message: 'AI Model evaluated invoice semantics. Extracted 4 line items successfully.',
      metadata: { provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet', tokens: 412 },
      timestamp: new Date(Date.now() - 3596500).toISOString()
    },
    {
      id: 'log-4',
      _id: 'log-4',
      executionId: sampleExec.id,
      workflowId: sampleExec.workflowId,
      nodeId: 'node-ai-parse',
      agent: 'validation',
      level: 'info',
      message: 'Schema validator verified required fields: [vendor, total, currency, items].',
      metadata: { valid: true },
      timestamp: new Date(Date.now() - 3596000).toISOString()
    },
    {
      id: 'log-5',
      _id: 'log-5',
      executionId: sampleExec.id,
      workflowId: sampleExec.workflowId,
      nodeId: 'node-sheets',
      agent: 'execution',
      level: 'success',
      message: 'Appended row 142 to Google Sheet "Invoices!A:F".',
      metadata: { status: 200, row: 142 },
      timestamp: new Date(Date.now() - 3595000).toISOString()
    },
    {
      id: 'log-6',
      _id: 'log-6',
      executionId: sampleExec.id,
      workflowId: sampleExec.workflowId,
      nodeId: 'node-slack',
      agent: 'execution',
      level: 'success',
      message: 'Posted approval notification to Slack channel #finance-ops.',
      metadata: { channel: '#finance-ops' },
      timestamp: new Date(Date.now() - 3594200).toISOString()
    },
    {
      id: 'log-7',
      _id: 'log-7',
      executionId: sampleExec.id,
      workflowId: sampleExec.workflowId,
      nodeId: null,
      agent: 'monitoring',
      level: 'success',
      message: 'Workflow execution completed successfully in 6000ms. All SLA bounds satisfied.',
      metadata: { duration: 6000, finalState: 'COMPLETED' },
      timestamp: new Date(Date.now() - 3594000).toISOString()
    }
  ];
  memory.executionLogs.push(...sampleLogs);

  // Pre-seeded Notifications
  memory.notifications.push(
    {
      id: 'notif-1',
      _id: 'notif-1',
      owner: operatorUser.id,
      workflowId: 'wf-invoice-triage',
      executionId: sampleExec.id,
      type: 'success',
      title: 'Workflow Completed',
      message: 'Invoice Triage & Slack Dispatch completed successfully for INV-88219.',
      isRead: false,
      createdAt: new Date(Date.now() - 3594000).toISOString()
    },
    {
      id: 'notif-2',
      _id: 'notif-2',
      owner: operatorUser.id,
      workflowId: null,
      executionId: null,
      type: 'info',
      title: 'Multi-Agent Orchestrator Ready',
      message: 'Planner, Execution, Validation, Recovery, and Monitoring agents initialized.',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  );
}

export async function connectDatabase() {
  await seedMemoryDatabase();

  if (!env.mongoUri) {
    console.log('[Database] Running in Zero-Config In-Memory Mode (Zero external dependencies required)');
    return { mode: 'memory' };
  }

  try {
    const mongooseModule = await import('mongoose');
    const mongoose = mongooseModule.default || mongooseModule;
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('[Database] Connected to MongoDB URI successfully.');
    return { mode: 'mongodb' };
  } catch (error) {
    console.warn(`[Database] MongoDB unavailable (${error.message}). Falling back to robust in-memory database store.`);
    return { mode: 'memory' };
  }
}
