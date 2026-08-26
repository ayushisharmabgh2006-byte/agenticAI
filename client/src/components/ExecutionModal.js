import { useState, useEffect } from 'react';
import { X, Play, Loader2, CheckCircle2, AlertTriangle, ExternalLink, Activity } from 'lucide-react';
import Link from 'next/link';
import { api } from '../services/api';
import { subscribeToExecution } from '../services/socket';
import ExecutionTimeline from './ExecutionTimeline';

export default function ExecutionModal({ workflow, isOpen, onClose }) {
  if (!isOpen || !workflow) return null;

  const [inputJson, setInputJson] = useState('{\n  "vendor": "Acme Cloud Services",\n  "amount": 2450.00,\n  "invoiceNumber": "INV-77189",\n  "department": "Engineering"\n}');
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecution, setCurrentExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  // Subscribe to real-time socket events for this execution run
  useEffect(() => {
    if (!currentExecution?.id) return;

    const unsubscribe = subscribeToExecution(currentExecution.id, {
      onLog: (log) => {
        setLogs(prev => [...prev, log]);
      },
      onStatus: (statusData) => {
        setCurrentExecution(prev => ({ ...prev, ...statusData }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentExecution?.id]);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setLogs([]);
    setCurrentExecution(null);

    let parsedInput = {};
    try {
      if (inputJson.trim()) {
        parsedInput = JSON.parse(inputJson);
      }
    } catch (e) {
      setError('Invalid JSON input format');
      setIsRunning(false);
      return;
    }

    try {
      const { data } = await api.post(`/workflows/${workflow.id || workflow._id}/execute`, { input: parsedInput });
      setCurrentExecution(data.execution);
      // Fetch initial timeline logs
      const timelineRes = await api.get(`/executions/${data.execution.id}/timeline`);
      if (timelineRes.data.logs) {
        setLogs(timelineRes.data.logs);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to trigger execution run');
    } finally {
      setIsRunning(false);
    }
  };

  const isCompleted = currentExecution?.status === 'COMPLETED';
  const isFailed = currentExecution?.status === 'FAILED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#13161a] border border-[#262c35] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#262c35] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#1b1f26] border border-[#262c35] grid place-items-center text-[#c7f36b]">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="font-grotesk font-bold text-base text-white">Execute Multi-Agent Pipeline</h3>
              <p className="text-xs text-muted font-mono">{workflow.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#1b1f26] text-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Input JSON */}
          {!currentExecution && (
            <div>
              <label className="block text-xs font-mono text-muted mb-2">
                Trigger Payload Input (JSON)
              </label>
              <textarea
                rows={5}
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                className="w-full bg-[#181b21] border border-[#262c35] rounded-xl p-3.5 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-[#c7f36b] resize-none"
              />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-[#2b191c] border border-[#fb7185]/40 text-xs text-[#fb7185] flex items-center gap-2 font-mono">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          {/* Live Execution State */}
          {currentExecution && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#181c22] border border-[#262c35] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted">Run Instance</span>
                  <div className="text-xs font-mono text-white font-bold">{currentExecution.id}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`status-badge ${currentExecution.status}`}>
                    {currentExecution.status}
                  </span>
                  {currentExecution.duration > 0 && (
                    <span className="text-xs font-mono text-muted">
                      {currentExecution.duration}ms
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono font-semibold text-muted uppercase mb-2.5">
                  Live Agent Timeline Stream
                </h4>
                <ExecutionTimeline logs={logs} />
              </div>

              {/* Output Result */}
              {isCompleted && currentExecution.outputs && (
                <div>
                  <h4 className="text-xs font-mono font-semibold text-muted uppercase mb-2">
                    Final Pipeline Outputs
                  </h4>
                  <pre className="p-3.5 bg-[#0d0f12] rounded-xl border border-[#262c35] text-xs font-mono text-[#a3e635] overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(currentExecution.outputs, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-[#262c35] bg-[#101216] flex items-center justify-between">
          {currentExecution?.id ? (
            <Link
              href={`/executions/${currentExecution.id}`}
              className="text-xs text-[#c7f36b] hover:underline flex items-center gap-1.5 font-medium"
            >
              Open Full Audit Log <ExternalLink size={13} />
            </Link>
          ) : (
            <span className="text-xs text-muted font-mono">Ready to dispatch run</span>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="secondary-button small"
            >
              {currentExecution ? 'Close' : 'Cancel'}
            </button>

            {!currentExecution && (
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="primary-button small"
              >
                {isRunning ? <Loader2 className="animate-spin" size={15} /> : <Play size={15} />}
                {isRunning ? 'Orchestrating...' : 'Trigger Pipeline'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
