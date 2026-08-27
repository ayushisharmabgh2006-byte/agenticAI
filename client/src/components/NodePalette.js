import { Zap, Sparkles, Mail, MessageSquare, MessageCircle, FileSpreadsheet, GitBranch, Plus, Globe, Clock } from 'lucide-react';

const PALETTE_CATEGORIES = [
  {
    category: 'Triggers',
    items: [
      { type: 'trigger', provider: 'webhook', label: 'Webhook Ingest', icon: Globe, color: 'text-[#fbbf24]', config: { event: 'webhook.received' } },
      { type: 'trigger', provider: 'gmail', label: 'Gmail Poller', icon: Mail, color: 'text-[#fb7185]', config: { query: 'is:unread label:inbox' } },
      { type: 'trigger', provider: 'schedule', label: 'Schedule Cron', icon: Clock, color: 'text-[#a855f7]', config: { schedule: '0 * * * *' } },
      { type: 'trigger', provider: 'manual', label: 'Manual Trigger', icon: Zap, color: 'text-[#38bdf8]', config: { event: 'manual' } }
    ]
  },
  {
    category: 'AI Reasoning',
    items: [
      { type: 'ai', provider: 'openrouter', label: 'AI Cognitive Model', icon: Sparkles, color: 'text-[#c084fc]', config: { instruction: 'Reason over input and format output.', model: 'anthropic/claude-3.5-sonnet' } },
      { type: 'ai', provider: 'gemini', label: 'Gemini Classifier', icon: Sparkles, color: 'text-[#c084fc]', config: { instruction: 'Classify sentiment and urgency.', model: 'gemini-1.5-pro' } }
    ]
  },
  {
    category: 'Integrations',
    items: [
      { type: 'integration', provider: 'gmail', label: 'Send Email', icon: Mail, color: 'text-[#fb7185]', config: { to: '{{user.email}}', subject: 'Notification', action: 'send_email' } },
      { type: 'integration', provider: 'slack', label: 'Post Slack Alert', icon: MessageSquare, color: 'text-[#38bdf8]', config: { channel: '#ops-alerts', message: 'Alert from workflow', action: 'post_message' } },
      { type: 'integration', provider: 'discord', label: 'Discord Webhook', icon: MessageCircle, color: 'text-[#818cf8]', config: { channel: '#general', message: 'Discord event', action: 'post_embed' } },
      { type: 'integration', provider: 'google-sheets', label: 'Append Sheet Row', icon: FileSpreadsheet, color: 'text-[#34d399]', config: { spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', range: 'Sheet1!A:Z', action: 'append_row' } }
    ]
  },
  {
    category: 'Logic & Flow',
    items: [
      { type: 'condition', provider: 'logic', label: 'Condition Branch', icon: GitBranch, color: 'text-[#fbbf24]', config: { field: 'status', operator: 'equals', value: 'approved' } }
    ]
  }
];

export default function NodePalette({ onAddNode }) {
  const handleAdd = (item) => {
    const id = `node-${item.provider}-${Date.now().toString(36).slice(2, 6)}`;
    const newNode = {
      id,
      type: item.type,
      position: { x: 250 + Math.random() * 200, y: 150 + Math.random() * 150 },
      data: {
        label: item.label,
        type: item.type,
        provider: item.provider,
        config: { ...item.config }
      }
    };
    if (onAddNode) onAddNode(newNode);
  };

  return (
    <aside className="w-72 bg-[#13161a] border-r border-[#262c35] p-4 flex flex-col h-full overflow-y-auto">
      <div className="mb-4">
        <span className="eyebrow">NODE PALETTE</span>
        <h3 className="font-grotesk font-semibold text-sm text-white mt-1">Available Blocks</h3>
      </div>

      <div className="space-y-5">
        {PALETTE_CATEGORIES.map((cat, idx) => (
          <div key={idx}>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted px-1">
              {cat.category}
            </span>
            <div className="mt-2 space-y-1.5">
              {cat.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleAdd(item)}
                    className="w-full p-2.5 rounded-lg bg-[#181b21] hover:bg-[#20252d] border border-[#262c35] hover:border-[#38414e] transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-7 w-7 rounded-md bg-[#222832] grid place-items-center ${item.color}`}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-[#a855f7] transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[10px] font-mono text-muted">{item.provider}</div>
                      </div>
                    </div>

                    <Plus size={14} className="text-muted group-hover:text-white transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
