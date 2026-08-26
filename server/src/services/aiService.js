import { env } from '../config/env.js';

export async function generateWorkflow(prompt = '') {
  const text = (prompt || '').trim();
  const lower = text.toLowerCase();

  // Tier 1: OpenRouter AI Generation
  if (env.openRouterApiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Agentflow AI'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: `You are an AI Workflow Architect for Agentflow_AI. Return ONLY valid JSON matching this schema:
{
  "name": "string (title of automation)",
  "description": "string",
  "triggerConfig": { "type": "manual" | "webhook" | "cron", "event": "string" },
  "nodes": [
    { "id": "string", "type": "trigger"|"ai"|"integration"|"condition", "position": { "x": number, "y": number }, "data": { "label": "string", "type": "string", "provider": "string", "config": {} } }
  ],
  "edges": [
    { "id": "string", "source": "string", "target": "string", "animated": true }
  ],
  "tags": ["string"]
}`
            },
            { role: 'user', content: text }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content);
        return {
          ...parsed,
          generationMode: 'openrouter',
          version: 1
        };
      }
    } catch (e) {
      console.warn('[AIService] OpenRouter call failed, falling back:', e.message);
    }
  }

  // Tier 2: Gemini SDK Fallback
  if (env.geminiApiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.geminiApiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a valid Agentflow JSON workflow for the following automation request: "${text}".
Return ONLY raw JSON with properties { name, description, triggerConfig, nodes, edges, tags }.`
            }]
          }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (response.ok) {
        const json = await response.json();
        const raw = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            ...parsed,
            generationMode: 'gemini',
            version: 1
          };
        }
      }
    } catch (e) {
      console.warn('[AIService] Gemini call failed, falling back to deterministic:', e.message);
    }
  }

  // Tier 3: Deterministic Rule-Based Workflow Generator
  return buildDeterministicWorkflow(text, lower);
}

function buildDeterministicWorkflow(rawText, lower) {
  let title = 'Automated Operations Pipeline';
  let description = rawText || 'Multi-agent automated workflow with real-time tracking';
  let tags = ['automation', 'multi-agent'];
  const nodes = [];
  const edges = [];

  let startX = 80;
  const startY = 160;
  const gapX = 300;

  // 1. Determine Trigger Node
  if (lower.includes('email') || lower.includes('inbox') || lower.includes('gmail')) {
    title = 'Gmail Event Pipeline';
    tags.push('gmail', 'email');
    nodes.push({
      id: 'node-trigger-mail',
      type: 'trigger',
      position: { x: startX, y: startY },
      data: {
        label: 'Poll Gmail Inbox',
        type: 'trigger',
        provider: 'gmail',
        config: { query: 'is:unread label:inbox' }
      }
    });
  } else if (lower.includes('invoice') || lower.includes('webhook') || lower.includes('payment') || lower.includes('stripe')) {
    title = 'Invoice & Payment Ingest Pipeline';
    tags.push('finance', 'invoices', 'webhook');
    nodes.push({
      id: 'node-trigger-webhook',
      type: 'trigger',
      position: { x: startX, y: startY },
      data: {
        label: 'Incoming Webhook Payload',
        type: 'trigger',
        provider: 'webhook',
        config: { event: 'invoice.received', endpoint: '/api/v1/invoices' }
      }
    });
  } else if (lower.includes('sheet') || lower.includes('row') || lower.includes('lead')) {
    title = 'Lead & Data Synchronizer';
    tags.push('google-sheets', 'crm');
    nodes.push({
      id: 'node-trigger-schedule',
      type: 'trigger',
      position: { x: startX, y: startY },
      data: {
        label: 'Scheduled Data Ingest',
        type: 'trigger',
        provider: 'schedule',
        config: { schedule: '*/15 * * * *' }
      }
    });
  } else {
    title = rawText ? rawText.slice(0, 42) : 'Custom Multi-Agent Flow';
    nodes.push({
      id: 'node-trigger-manual',
      type: 'trigger',
      position: { x: startX, y: startY },
      data: {
        label: 'Manual Trigger',
        type: 'trigger',
        provider: 'manual',
        config: { event: 'manual' }
      }
    });
  }

  // 2. Add AI Agent Node
  startX += gapX;
  const aiLabel = lower.includes('invoice') ? 'AI Invoice Extractor & Validator' :
                  lower.includes('sentiment') || lower.includes('support') ? 'AI Customer Sentiment Analyzer' :
                  lower.includes('lead') ? 'AI Lead Qualifier' : 'AI Reasoning & Transformation';

  nodes.push({
    id: 'node-ai-agent',
    type: 'ai',
    position: { x: startX, y: startY },
    data: {
      label: aiLabel,
      type: 'ai',
      provider: 'openrouter',
      config: {
        instruction: rawText || 'Analyze input payload, extract attributes, and format for downstream tools.',
        model: 'anthropic/claude-3.5-sonnet'
      }
    }
  });
  edges.push({ id: `edge-1`, source: nodes[0].id, target: 'node-ai-agent', animated: true });

  // 3. Add Destination Integrations (Google Sheets, Slack, Discord, Gmail)
  let prevNodeId = 'node-ai-agent';

  if (lower.includes('sheet') || lower.includes('excel') || lower.includes('database') || lower.includes('invoice') || lower.includes('lead')) {
    startX += gapX;
    const sheetsNodeId = 'node-sheets-append';
    nodes.push({
      id: sheetsNodeId,
      type: 'integration',
      position: { x: startX, y: startY - 60 },
      data: {
        label: 'Append to Google Sheet',
        type: 'integration',
        provider: 'google-sheets',
        config: {
          spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          range: 'Records!A:F',
          action: 'append_row'
        }
      }
    });
    edges.push({ id: `edge-${edges.length + 1}`, source: prevNodeId, target: sheetsNodeId, animated: true });
    tags.push('google-sheets');
  }

  if (lower.includes('slack') || (!lower.includes('discord') && !lower.includes('gmail'))) {
    startX += gapX;
    const slackNodeId = 'node-slack-notify';
    nodes.push({
      id: slackNodeId,
      type: 'integration',
      position: { x: startX, y: startY + 60 },
      data: {
        label: 'Dispatch Slack Alert',
        type: 'integration',
        provider: 'slack',
        config: {
          channel: '#ops-alerts',
          message: '⚡ *Agentflow Automated Event*\nWorkflow: ' + title + '\nSummary: {{node-ai-agent.summary}}',
          action: 'post_message'
        }
      }
    });
    edges.push({ id: `edge-${edges.length + 1}`, source: prevNodeId, target: slackNodeId, animated: true });
    tags.push('slack');
  }

  if (lower.includes('discord')) {
    startX += gapX;
    const discordNodeId = 'node-discord-notify';
    nodes.push({
      id: discordNodeId,
      type: 'integration',
      position: { x: startX, y: startY + 80 },
      data: {
        label: 'Post Discord Alert',
        type: 'integration',
        provider: 'discord',
        config: {
          channel: '#general',
          message: '🚀 **Agentflow Automation Triggered**\nOutcome verified by Validation Agent.',
          action: 'post_embed'
        }
      }
    });
    edges.push({ id: `edge-${edges.length + 1}`, source: prevNodeId, target: discordNodeId, animated: true });
    tags.push('discord');
  }

  if (lower.includes('email') || lower.includes('send mail') || lower.includes('reply')) {
    startX += gapX;
    const emailNodeId = 'node-gmail-send';
    nodes.push({
      id: emailNodeId,
      type: 'integration',
      position: { x: startX, y: startY - 40 },
      data: {
        label: 'Send Gmail Confirmation',
        type: 'integration',
        provider: 'gmail',
        config: {
          to: '{{trigger.payload.email}}',
          subject: 'Automation update: ' + title,
          body: 'Your request was processed successfully by Agentflow Multi-Agent Orchestrator.',
          action: 'send_email'
        }
      }
    });
    edges.push({ id: `edge-${edges.length + 1}`, source: prevNodeId, target: emailNodeId, animated: true });
    tags.push('gmail');
  }

  return {
    name: title,
    description,
    tags: Array.from(new Set(tags)),
    triggerConfig: nodes[0].data?.config || { type: 'manual' },
    nodes,
    edges,
    version: 1,
    generationMode: 'deterministic'
  };
}
