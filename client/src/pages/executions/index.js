import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Layers,
  ChevronRight,
  Loader2
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';

export default function ExecutionsListPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchExecutions = async () => {
    try {
      const { data } = await api.get('/executions', {
        params: { status: statusFilter || undefined, page, limit: 30 }
      });
      setExecutions(data.executions || []);
    } catch (err) {
      console.error('Error fetching executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();

    // Listen for global status updates via Socket.IO
    const socket = getSocket();
    if (socket) {
      const handleGlobalStatus = () => {
        fetchExecutions();
      };
      socket.on('global:status', handleGlobalStatus);
      return () => {
        socket.off('global:status', handleGlobalStatus);
      };
    }
  }, [statusFilter, page]);

  const filtered = executions.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (e.workflowName && e.workflowName.toLowerCase().includes(q)) ||
           (e.id && e.id.toLowerCase().includes(q));
  });

  const statuses = ['ALL', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED', 'CANCELLED'];

  return (
    <ProtectedRoute>
      <AppShell activeTitle="Execution Log">
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search by workflow name or execution ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#13161a] border border-[#262c35] rounded-xl px-4 py-2.5 text-xs text-white pl-10 focus:outline-none focus:border-[#a855f7]"
              />
              <Search size={15} className="absolute left-3.5 top-3 text-muted" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {statuses.map(s => {
                const isSelected = (s === 'ALL' && !statusFilter) || statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s === 'ALL' ? '' : s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-[#a855f7] text-ink font-bold'
                        : 'bg-[#13161a] border border-[#262c35] text-muted hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Executions Table */}
          <div className="card-panel p-0 overflow-hidden">
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="animate-spin text-[#a855f7] mx-auto" size={32} />
                <p className="text-xs font-mono text-muted mt-3">Loading telemetry audit logs...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-muted">
                <Activity size={32} className="mx-auto mb-2 text-muted/40" />
                <p className="text-sm font-semibold text-white">No execution runs found</p>
                <p className="text-xs font-mono text-muted/70 mt-1">Execute a workflow to start recording agent telemetry.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#181c22] border-b border-[#262c35] font-mono text-[11px] text-muted uppercase">
                      <th className="py-3.5 px-5">Execution ID</th>
                      <th className="py-3.5 px-5">Workflow</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">Duration</th>
                      <th className="py-3.5 px-5">Timestamp</th>
                      <th className="py-3.5 px-5 text-right">Audit Trace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262c35]">
                    {filtered.map((e) => (
                      <tr key={e.id} className="hover:bg-[#181c22]/50 transition-colors">
                        <td className="py-4 px-5 font-mono text-white font-medium">
                          {e.id}
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-semibold text-white">{e.workflowName}</span>
                          <span className="block text-[10px] font-mono text-muted mt-0.5">{e.workflowId}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`status-badge ${e.status}`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono text-muted">
                          {e.duration ? `${e.duration}ms` : 'In progress'}
                        </td>
                        <td className="py-4 px-5 font-mono text-muted">
                          {new Date(e.startTime || e.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Link
                            href={`/executions/${e.id}`}
                            className="inline-flex items-center gap-1 text-xs text-[#a855f7] hover:underline font-semibold"
                          >
                            Inspect Run <ChevronRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
