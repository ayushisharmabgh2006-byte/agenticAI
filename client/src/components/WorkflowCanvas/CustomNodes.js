import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Zap,
  Sparkles,
  Bot,
  Mail,
  MessageSquare,
  MessageCircle,
  FileSpreadsheet,
  GitBranch,
  CheckCircle2,
  Settings,
  Flame,
  Globe
} from 'lucide-react';

function getProviderIcon(provider) {
  switch (provider?.toLowerCase()) {
    case 'gmail': return <Mail size={15} className="text-[#fb7185]" />;
    case 'slack': return <MessageSquare size={15} className="text-[#38bdf8]" />;
    case 'discord': return <MessageCircle size={15} className="text-[#818cf8]" />;
    case 'google-sheets': return <FileSpreadsheet size={15} className="text-[#34d399]" />;
    case 'openrouter':
    case 'gemini':
    case 'ai': return <Bot size={15} className="text-[#c084fc]" />;
    case 'webhook': return <Globe size={15} className="text-[#fbbf24]" />;
    default: return <Zap size={15} className="text-[#c7f36b]" />;
  }
}

export const TriggerNode = memo(({ data, selected }) => {
  return (
    <div className={`p-4 rounded-xl bg-[#171b21] border transition-all duration-200 min-w-[220px] shadow-xl ${
      selected ? 'border-[#c7f36b] ring-2 ring-[#c7f36b]/20' : 'border-[#2a313c] hover:border-[#3d4757]'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#222832] border border-[#343d4b] grid place-items-center text-[#c7f36b]">
            <Zap size={16} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#c7f36b]">TRIGGER</span>
            <h4 className="text-xs font-bold text-white tracking-tight">{data.label || 'Event Ingest'}</h4>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#262c35] flex items-center justify-between text-[11px] font-mono text-muted">
        <span>{data.provider || 'manual'}</span>
        <span className="h-2 w-2 rounded-full bg-[#c7f36b] shadow-[0_0_8px_#c7f36b]"></span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#c7f36b] !border-2 !border-[#13161a] !-right-1.5"
      />
    </div>
  );
});

export const AiNode = memo(({ data, selected }) => {
  return (
    <div className={`p-4 rounded-xl bg-[#191824] border transition-all duration-200 min-w-[240px] shadow-xl ${
      selected ? 'border-[#c084fc] ring-2 ring-[#c084fc]/20' : 'border-[#382f4e] hover:border-[#4f436e]'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#c084fc] !border-2 !border-[#13161a] !-left-1.5"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#27203d] border border-[#48396f] grid place-items-center text-[#c084fc]">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#c084fc]">AI REASONING</span>
            <h4 className="text-xs font-bold text-white tracking-tight">{data.label || 'Cognitive Agent'}</h4>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-muted-light line-clamp-2 leading-relaxed">
        {data.config?.instruction || 'Processes structured input data and generates intelligence.'}
      </p>

      <div className="mt-3 pt-2.5 border-t border-[#2e2642] flex items-center justify-between text-[11px] font-mono text-muted">
        <span>{data.provider || 'openrouter'}</span>
        <span className="text-[10px] text-[#c084fc] bg-[#27203d] px-2 py-0.5 rounded">
          {data.config?.model?.split('/')[1] || 'claude-3.5'}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#c084fc] !border-2 !border-[#13161a] !-right-1.5"
      />
    </div>
  );
});

export const IntegrationNode = memo(({ data, selected }) => {
  return (
    <div className={`p-4 rounded-xl bg-[#161a20] border transition-all duration-200 min-w-[230px] shadow-xl ${
      selected ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/20' : 'border-[#27303d] hover:border-[#384558]'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#38bdf8] !border-2 !border-[#13161a] !-left-1.5"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#1f2733] border border-[#313f52] grid place-items-center">
            {getProviderIcon(data.provider)}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38bdf8]">
              {data.provider || 'INTEGRATION'}
            </span>
            <h4 className="text-xs font-bold text-white tracking-tight">{data.label || 'Tool Action'}</h4>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#242b36] flex items-center justify-between text-[11px] font-mono text-muted">
        <span>{data.config?.action || 'execute'}</span>
        <span className="text-[10px] text-[#38bdf8] bg-[#1a2533] px-2 py-0.5 rounded">
          Connected
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#38bdf8] !border-2 !border-[#13161a] !-right-1.5"
      />
    </div>
  );
});

export const ConditionNode = memo(({ data, selected }) => {
  return (
    <div className={`p-4 rounded-xl bg-[#1b1916] border transition-all duration-200 min-w-[210px] shadow-xl ${
      selected ? 'border-[#fbbf24] ring-2 ring-[#fbbf24]/20' : 'border-[#3f3521] hover:border-[#584a2d]'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#fbbf24] !border-2 !border-[#13161a] !-left-1.5"
      />

      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-[#292317] border border-[#4d3e24] grid place-items-center text-[#fbbf24]">
          <GitBranch size={16} />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#fbbf24]">LOGIC / ROUTE</span>
          <h4 className="text-xs font-bold text-white tracking-tight">{data.label || 'Condition Branch'}</h4>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#312a1b] flex items-center justify-between text-[11px] font-mono text-muted">
        <span>If / Else Branch</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="!w-3 !h-3 !bg-[#a3e635] !border-2 !border-[#13161a] !-right-1.5 !top-1/3"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="!w-3 !h-3 !bg-[#fb7185] !border-2 !border-[#13161a] !-right-1.5 !top-2/3"
      />
    </div>
  );
});

export const nodeTypes = {
  trigger: TriggerNode,
  ai: AiNode,
  integration: IntegrationNode,
  condition: ConditionNode
};
