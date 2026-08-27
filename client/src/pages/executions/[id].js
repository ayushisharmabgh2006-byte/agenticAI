import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Play,
  Pause,
  XCircle,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Loader2,
  Workflow
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import ExecutionTimeline from '../../components/ExecutionTimeline';
import { api } from '../../services/api';
import { subscribeToExecution } from '../../services/socket';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExecution = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/executions/${id}`);
      setExecution(data.execution);
      const timelineRes = await api.get(`/executions/${id}/timeline`);
      setLogs(timelineRes.data.logs || []);
    } catch (err) {
      console.error('Error loading execution detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecution();

    if (id) {
      const unsubscribe = subscribeToExecution(id, {
        onLog: (log) => {
          setLogs(prev => [...prev, log]);
        },
        onStatus: (statusData) => {
          setExecution(prev => prev ? ({ ...prev, ...statusData }) : null);
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [id]);

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await api.post(`/executions/${id}/pause`);
      fetchExecution();
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await api.post(`/executions/${id}/resume`);
      fetchExecution();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this execution run?')) return;
    setActionLoading(true);
    try {
      await api.post(`/executions/${id}/cancel`);
      fetchExecution();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/executions/${id}/retry`);
      if (data.execution?.id) {
        router.push(`/executions/${data.execution.id}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !execution) {
    return (
      <ProtectedRoute>
        <AppShell activeTitle="Execution Detail">
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-[#a855f7] mx-auto mb-3" size={32} />
            <p className="text-xs font-mono text-muted">Loading execution snapshot...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const isRunning = execution.status === 'RUNNING';
  const isPaused = execution.status === 'PAUSED';

  return (
    <ProtectedRoute>
      <AppShell activeTitle={execution.workflowName || 'Execution Detail'}>
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="p-6 rounded-2xl bg-[#13161a] border border-[#262c35] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/executions"
                className="p-2 rounded-xl hover:bg-[#1b1f26] text-muted hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-grotesk text-xl font-bold text-white">
                    {execution.workflowName}
                  </h2>
                  <span className={`status-badge ${execution.status}`}>
                    {execution.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-muted mt-0.5">
                  Instance ID: {execution.id} • Duration: {execution.duration}ms
                </div>
              </div>
            </div>

            {/* Lifecycle Control Buttons */}
            <div className="flex items-center gap-2.5">
              {isRunning && (
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="secondary-button small"
                >
                  <Pause size={14} /> Pause Run
                </button>
              )}

              {isPaused && (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="primary-button small"
                >
                  <Play size={14} /> Resume Run
                </button>
              )}

              {(isRunning || isPaused) && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="danger-button text-xs"
                >
                  <XCircle size={14} /> Cancel
                </button>
              )}

              {!isRunning && !isPaused && (
                <button
                  onClick={handleRetry}
                  disabled={actionLoading}
                  className="primary-button small"
                >
                  <RotateCw size={14} /> Re-Run Pipeline
                </button>
              )}
            </div>
          </div>

          {/* Grid Layout: Timeline and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Live Multi-Agent Event Stream */}
            <div className="lg:col-span-7 space-y-4">
              <div className="card-panel">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#262c35] mb-4">
                  <div>
                    <span className="eyebrow">AGENTIC TELEMETRY</span>
                    <h3 className="font-grotesk font-bold text-sm text-white">Execution Timeline</h3>
                  </div>
                  <span className="text-[10px] font-mono text-muted">
                    {logs.length} logged events
                  </span>
                </div>

                <ExecutionTimeline logs={logs} />
              </div>
            </div>

            {/* Right: Snapshot, Inputs, Outputs */}
            <div className="lg:col-span-5 space-y-4">
              {/* Outputs Box */}
              <div className="card-panel">
                <span className="eyebrow block mb-2 font-semibold">PIPELINE OUTPUTS</span>
                <pre className="p-3.5 bg-[#0d0f12] rounded-xl border border-[#262c35] text-xs font-mono text-[#a3e635] overflow-x-auto max-h-56 leading-relaxed">
                  {JSON.stringify(execution.outputs || {}, null, 2)}
                </pre>
              </div>

              {/* Inputs Box */}
              <div className="card-panel">
                <span className="eyebrow block mb-2 font-semibold">TRIGGER INPUT PAYLOAD</span>
                <pre className="p-3.5 bg-[#0d0f12] rounded-xl border border-[#262c35] text-xs font-mono text-muted-light overflow-x-auto max-h-40 leading-relaxed">
                  {JSON.stringify(execution.inputs || {}, null, 2)}
                </pre>
              </div>

              {/* Snapshot Info */}
              <div className="card-panel space-y-3 font-mono text-xs">
                <span className="eyebrow block mb-1">AUDIT METADATA</span>
                <div className="flex justify-between py-1.5 border-b border-[#262c35]">
                  <span className="text-muted">Workflow ID</span>
                  <Link href={`/workflows/${execution.workflowId}`} className="text-[#a855f7] hover:underline font-bold">
                    {execution.workflowId}
                  </Link>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#262c35]">
                  <span className="text-muted">Nodes Count</span>
                  <span className="text-white">{execution.workflowSnapshot?.nodes?.length || 0}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#262c35]">
                  <span className="text-muted">Retry Count</span>
                  <span className="text-white">{execution.retryCount || 0}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#262c35]">
                  <span className="text-muted">Start Time</span>
                  <span className="text-white">{new Date(execution.startTime).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
