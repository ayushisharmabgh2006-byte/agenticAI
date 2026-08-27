import { useState, useEffect } from 'react';
import { X, Trash2, Settings, Sparkles, Check } from 'lucide-react';

export default function NodeConfigPanel({ node, onUpdateNode, onDeleteNode, onClose }) {
  if (!node) return null;

  const [label, setLabel] = useState(node.data?.label || '');
  const [config, setConfig] = useState(node.data?.config || {});
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    setLabel(node.data?.label || '');
    setConfig(node.data?.config || {});
  }, [node]);

  const handleConfigChange = (key, value) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    if (onUpdateNode) {
      onUpdateNode(node.id, { label, config: updated });
    }
  };

  const handleLabelChange = (newLabel) => {
    setLabel(newLabel);
    if (onUpdateNode) {
      onUpdateNode(node.id, { label: newLabel, config });
    }
  };

  const nodeType = node.type || node.data?.type;
  const provider = node.data?.provider || '';

  return (
    <aside className="w-80 bg-[#13161a] border-l border-[#262c35] p-5 flex flex-col h-full overflow-y-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#262c35]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#1b1f26] border border-[#262c35] grid place-items-center text-[#a855f7]">
            <Settings size={14} />
          </div>
          <div>
            <span className="eyebrow">CONFIG INSPECTOR</span>
            <h3 className="font-grotesk font-semibold text-xs text-white uppercase">{nodeType} Node</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[#1b1f26] text-muted hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-5 space-y-4 flex-1">
        {/* Node Label */}
        <div>
          <label className="block text-xs font-mono text-muted mb-1.5">Block Name</label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full bg-[#181b21] border border-[#262c35] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
          />
        </div>

        {/* Node ID */}
        <div>
          <label className="block text-xs font-mono text-muted mb-1.5">Node Reference ID</label>
          <div className="bg-[#181b21] border border-[#262c35] rounded-lg px-3 py-2 text-xs font-mono text-muted">
            {node.id}
          </div>
        </div>

        {/* Dynamic Fields for AI Nodes */}
        {nodeType === 'ai' && (
          <>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">AI Foundation Model</label>
              <select
                value={config.model || 'anthropic/claude-3.5-sonnet'}
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c084fc]"
              >
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (OpenRouter)</option>
                <option value="openai/gpt-4o">GPT-4o (OpenRouter)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Google)</option>
                <option value="deterministic-engine">Deterministic Rule Engine (Offline)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Agent Prompt / Instruction</label>
              <textarea
                rows={4}
                value={config.instruction || ''}
                onChange={(e) => handleConfigChange('instruction', e.target.value)}
                placeholder="Describe reasoning task... (Supports {{variables}})"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg p-3 text-xs text-white resize-none focus:outline-none focus:border-[#c084fc] font-mono leading-relaxed"
              />
            </div>
          </>
        )}

        {/* Dynamic Fields for Slack */}
        {provider === 'slack' && (
          <>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Slack Channel</label>
              <input
                type="text"
                value={config.channel || '#ops-alerts'}
                onChange={(e) => handleConfigChange('channel', e.target.value)}
                placeholder="#channel-name"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Message Template</label>
              <textarea
                rows={3}
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="Notification message... {{variable}}"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg p-3 text-xs text-white resize-none focus:outline-none focus:border-[#38bdf8] font-mono"
              />
            </div>
          </>
        )}

        {/* Dynamic Fields for Gmail */}
        {provider === 'gmail' && nodeType === 'integration' && (
          <>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Recipient Address (To)</label>
              <input
                type="text"
                value={config.to || ''}
                onChange={(e) => handleConfigChange('to', e.target.value)}
                placeholder="team@example.com or {{trigger.email}}"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fb7185]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Subject</label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
                placeholder="Email Subject line"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fb7185]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Body Content</label>
              <textarea
                rows={3}
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                placeholder="Email body text..."
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg p-3 text-xs text-white resize-none focus:outline-none focus:border-[#fb7185]"
              />
            </div>
          </>
        )}

        {/* Dynamic Fields for Google Sheets */}
        {provider === 'google-sheets' && (
          <>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Spreadsheet ID</label>
              <input
                type="text"
                value={config.spreadsheetId || ''}
                onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#34d399] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Sheet Range</label>
              <input
                type="text"
                value={config.range || 'Sheet1!A:Z'}
                onChange={(e) => handleConfigChange('range', e.target.value)}
                placeholder="Sheet1!A:Z"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#34d399] font-mono"
              />
            </div>
          </>
        )}

        {/* Dynamic Fields for Discord */}
        {provider === 'discord' && (
          <>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Discord Channel</label>
              <input
                type="text"
                value={config.channel || '#general'}
                onChange={(e) => handleConfigChange('channel', e.target.value)}
                placeholder="#general"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#818cf8]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Embed Message</label>
              <textarea
                rows={3}
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="Discord embed message..."
                className="w-full bg-[#181b21] border border-[#262c35] rounded-lg p-3 text-xs text-white resize-none focus:outline-none focus:border-[#818cf8] font-mono"
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Action */}
      <div className="pt-4 border-t border-[#262c35]">
        <button
          onClick={() => onDeleteNode(node.id)}
          className="w-full danger-button text-xs py-2.5 flex items-center justify-center gap-2"
        >
          <Trash2 size={14} /> Remove Node
        </button>
      </div>
    </aside>
  );
}
