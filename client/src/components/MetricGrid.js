import { ArrowUpRight, TrendingUp, Zap, Workflow, CheckCircle2, Clock3, Layers } from 'lucide-react';

export default function MetricGrid({ metrics }) {
  const defaultMetrics = [
    {
      label: 'Active Workflows',
      value: metrics?.activeWorkflows || 12,
      trend: '+3 this month',
      sublabel: 'Operational pipelines',
      icon: Workflow,
      color: 'text-[#a855f7]'
    },
    {
      label: 'Success Rate',
      value: metrics?.successRate || '98.4%',
      trend: '+2.1% vs last week',
      sublabel: 'Validation passed',
      icon: CheckCircle2,
      color: 'text-[#38bdf8]'
    },
    {
      label: 'Execution Runs',
      value: metrics?.totalExecutions || 240,
      trend: '+48 today',
      sublabel: 'Throughput',
      icon: Zap,
      color: 'text-[#fbbf24]'
    },
    {
      label: 'Time Returned',
      value: `${metrics?.timeSavedHours || 41}h`,
      trend: 'Estimated savings',
      sublabel: 'Automation efficiency',
      icon: Clock3,
      color: 'text-[#c084fc]'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {defaultMetrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-xl bg-[#13161a] border border-[#262c35] hover:border-[#38414e] transition-all relative overflow-hidden group shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="eyebrow">{m.label}</span>
                <div className="text-3xl font-grotesk font-bold text-white mt-2 tracking-tight">
                  {m.value}
                </div>
              </div>
              <div className={`p-2.5 rounded-lg bg-[#1b1f26] border border-[#262c35] ${m.color} group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#262c35] flex items-center justify-between">
              <span className="text-xs font-mono text-[#a3e635] flex items-center gap-1 font-medium">
                <TrendingUp size={12} /> {m.trend}
              </span>
              <span className="text-[11px] font-mono text-muted">{m.sublabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
