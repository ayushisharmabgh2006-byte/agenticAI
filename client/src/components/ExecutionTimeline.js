import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  Bot,
  Brain,
  ShieldAlert,
  Activity,
  Layers
} from 'lucide-react';

function getAgentIcon(agent) {
  switch (agent?.toLowerCase()) {
    case 'planner': return <Brain size={14} className="text-[#38bdf8]" />;
    case 'execution': return <Layers size={14} className="text-[#c7f36b]" />;
    case 'validation': return <CheckCircle2 size={14} className="text-[#c084fc]" />;
    case 'recovery': return <ShieldAlert size={14} className="text-[#fbbf24]" />;
    case 'monitoring': return <Activity size={14} className="text-muted-light" />;
    default: return <Bot size={14} className="text-white" />;
  }
}

export default function ExecutionTimeline({ logs = [] }) {
  const [expandedLogId, setExpandedLogId] = useState(null);

  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center bg-[#13161a] border border-[#262c35] rounded-xl text-muted">
        <Activity size={28} className="mx-auto text-muted/50 mb-2 animate-pulse" />
        <p className="text-sm font-medium">Awaiting Execution Events</p>
        <p className="text-xs font-mono text-muted/70 mt-1">Multi-agent logs will stream here in real time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log, idx) => {
        const isExpanded = expandedLogId === (log.id || idx);
        const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;
        const isSuccess = log.level === 'success';
        const isError = log.level === 'error';
        const isWarning = log.level === 'warning';

        return (
          <div
            key={log.id || idx}
            className={`p-4 rounded-xl border transition-all ${
              isError
                ? 'bg-[#22171a] border-[#fb7185]/40'
                : isSuccess
                ? 'bg-[#141a16] border-[#c7f36b]/30'
                : 'bg-[#15181e] border-[#262c35]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Agent Icon Box */}
                <div className={`mt-0.5 h-7 w-7 rounded-lg bg-[#1c212a] border border-[#2e3744] grid place-items-center shrink-0`}>
                  {getAgentIcon(log.agent)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`agent-badge ${log.agent}`}>
                      {log.agent}
                    </span>
                    {log.nodeId && (
                      <span className="text-[10px] font-mono text-muted bg-[#1c2027] px-2 py-0.5 rounded border border-[#28303a]">
                        node: {log.nodeId}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-muted ml-auto shrink-0">
                      {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-white mt-1.5 leading-relaxed font-medium">
                    {log.message}
                  </p>

                  {/* Expandable Metadata Inspector */}
                  {hasMetadata && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : (log.id || idx))}
                        className="text-[11px] font-mono text-[#c7f36b] hover:underline flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {isExpanded ? 'Hide Payload' : 'Inspect Telemetry / Output'}
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 p-3 bg-[#0d0f12] rounded-lg border border-[#262c35] text-[11px] font-mono text-[#a3e635] overflow-x-auto max-h-48 leading-snug">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
