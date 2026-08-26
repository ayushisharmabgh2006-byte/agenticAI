import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Workflow,
  Sparkles,
  ArrowUpRight,
  Activity,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import AppShell from '../components/AppShell';
import MetricGrid from '../components/MetricGrid';
import ProtectedRoute from '../components/ProtectedRoute';
import { api } from '../services/api';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await api.get('/workflows/dashboard');
        setDashboardData(data);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const metrics = dashboardData?.metrics || {
    activeWorkflows: 12,
    totalWorkflows: 15,
    totalExecutions: 240,
    successRate: '98.4%',
    timeSavedHours: 41
  };

  const recentRuns = dashboardData?.recentRuns || [
    { id: 'exec-demo-101', name: 'Invoice Triage & Slack Dispatch', status: 'COMPLETED', duration: 917, createdAt: new Date().toISOString() },
    { id: 'exec-demo-102', name: 'VIP Customer Support Escalation', status: 'COMPLETED', duration: 1240, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'exec-demo-103', name: 'Google Sheets Leads Sync', status: 'PAUSED', duration: 4200, createdAt: new Date(Date.now() - 7200000).toISOString() }
  ];

  const agentHealth = dashboardData?.agentChainHealth || [
    { name: 'Planner Agent', health: '100%', score: 0.98, status: 'operational' },
    { name: 'Execution Agent', health: '99.2%', score: 0.96, status: 'operational' },
    { name: 'Validation Agent', health: '100%', score: 0.99, status: 'operational' },
    { name: 'Recovery Agent', health: '97.5%', score: 0.94, status: 'operational' },
    { name: 'Monitoring Agent', health: '100%', score: 1.0, status: 'operational' }
  ];

  return (
    <ProtectedRoute>
      <AppShell activeTitle="Command Center">
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="p-7 rounded-2xl bg-gradient-to-r from-[#17231a] via-[#141b17] to-[#13161a] border border-[#2c402d] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#c7f36b]">
                <span className="h-2 w-2 rounded-full bg-[#c7f36b] animate-pulse" />
                <span>ALL SYSTEMS OPERATIONAL</span>
              </div>
              <h2 className="font-grotesk text-3xl font-bold text-white tracking-tight">
                Make complex workflows <br />
                <span className="text-[#c7f36b]">effortlessly autonomous.</span>
              </h2>
              <p className="text-xs text-muted-light leading-relaxed">
                5 cooperating AI agents stand ready to plan, execute, validate, and recover your automation tasks in real time.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <Link href="/workflows/builder" className="primary-button small">
                <Sparkles size={15} /> Prompt AI Studio
              </Link>
              <Link href="/workflows" className="secondary-button small">
                <Workflow size={15} /> Manage Workflows
              </Link>
            </div>

            {/* Subtle decorative circles */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-[#2b442e]/40 pointer-events-none opacity-40" />
            <div className="absolute right-20 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-[#c7f36b]/20 pointer-events-none opacity-30" />
          </div>

          {/* Metric Grid */}
          <MetricGrid metrics={metrics} />

          {/* Grid Layout for Recent Activity & Agent Chain */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Executions Panel */}
            <div className="lg:col-span-7 card-panel">
              <div className="flex items-center justify-between pb-4 border-b border-[#262c35]">
                <div>
                  <span className="eyebrow">EXECUTION STREAM</span>
                  <h3 className="font-grotesk font-bold text-base text-white mt-0.5">Recent Pipeline Runs</h3>
                </div>
                <Link href="/executions" className="text-xs text-[#c7f36b] hover:underline flex items-center gap-1 font-medium">
                  View full logs <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[#262c35]">
                {recentRuns.map((run) => (
                  <div key={run.id} className="py-3.5 flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-[#181c22] border border-[#262c35] grid place-items-center text-[#c7f36b] shrink-0">
                        <Workflow size={15} />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/executions/${run.id}`} className="text-xs font-semibold text-white hover:text-[#c7f36b] transition-colors truncate block">
                          {run.name}
                        </Link>
                        <div className="text-[10px] font-mono text-muted mt-0.5">
                          {new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {run.id}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-muted">{run.duration}ms</span>
                      <span className={`status-badge ${run.status}`}>
                        {run.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Chain Health Panel */}
            <div className="lg:col-span-5 card-panel">
              <div className="flex items-center justify-between pb-4 border-b border-[#262c35]">
                <div>
                  <span className="eyebrow">AGENT FLEET</span>
                  <h3 className="font-grotesk font-bold text-base text-white mt-0.5">Chain Health & Telemetry</h3>
                </div>
                <span className="text-[10px] font-mono text-[#c7f36b] bg-[#1a251b] px-2 py-0.5 rounded border border-[#2e472e]">
                  Operational
                </span>
              </div>

              <div className="mt-4 space-y-3.5">
                {agentHealth.map((agent, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#171a1f] border border-[#262c35]">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted">0{i + 1}</span>
                        <b className="text-white font-medium">{agent.name}</b>
                      </div>
                      <span className="font-mono text-xs text-[#c7f36b] font-bold">{agent.health}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2.5 h-1.5 w-full bg-[#242b35] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#c7f36b] rounded-full"
                        style={{ width: agent.health }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
