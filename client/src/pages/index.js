import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  Sparkles,
  Bot,
  Brain,
  Layers,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Cable,
  Workflow,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();

  const agentChain = [
    { num: '01', name: 'Planner Agent', desc: 'Constructs deterministic DAG, orders nodes, and calculates confidence score.', color: 'text-[#38bdf8]', icon: Brain },
    { num: '02', name: 'Execution Agent', desc: 'Dispatches tool calls across Gmail, Slack, Discord, and Google Sheets.', color: 'text-[#c7f36b]', icon: Layers },
    { num: '03', name: 'Validation Agent', desc: 'Verifies required schemas and structural output integrity.', color: 'text-[#c084fc]', icon: CheckCircle2 },
    { num: '04', name: 'Recovery Agent', desc: 'Classifies failure states and orchestrates exponential backoff retries.', color: 'text-[#fbbf24]', icon: ShieldAlert },
    { num: '05', name: 'Monitoring Agent', desc: 'Streams live audit telemetry to Socket.IO and records execution traces.', color: 'text-[#cbd5e1]', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white relative overflow-hidden selection:bg-[#c7f36b] selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-[#1b3323]/40 via-[#102418]/20 to-transparent blur-3xl pointer-events-none" />

      {/* Header Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#262c35]/50">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[#c7f36b] text-black grid place-items-center font-black">
            <Zap size={20} />
          </div>
          <span className="font-grotesk font-bold text-xl tracking-tight">
            agentflow<span className="text-[#c7f36b]">_AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-mono text-muted hover:text-white px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="primary-button small"
          >
            Launch Console <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#172218] border border-[#2b442d] text-xs font-mono text-[#c7f36b]">
              <span className="h-2 w-2 rounded-full bg-[#c7f36b] animate-pulse" />
              <span>Multi-Agent Operations Automation</span>
            </div>

            <h1 className="font-grotesk text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Turn natural intent into <br />
              <span className="text-[#c7f36b]">resilient workflows.</span>
            </h1>

            <p className="text-muted-light text-base sm:text-lg max-w-xl leading-relaxed">
              Describe operations in plain English. Agentflow synthesizes interactive visual graphs, executed by a cooperating chain of AI agents with real-time auditability.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link href="/workflows/builder" className="primary-button">
                <Sparkles size={16} /> Prompt to Workflow
              </Link>
              <Link href="/dashboard" className="secondary-button">
                Explore Command Center
              </Link>
            </div>

            <div className="pt-8 border-t border-[#262c35] grid grid-cols-3 gap-6 font-mono">
              <div>
                <div className="text-2xl font-grotesk font-bold text-white">5 Agents</div>
                <div className="text-xs text-muted mt-1">Autonomous chain</div>
              </div>
              <div>
                <div className="text-2xl font-grotesk font-bold text-[#c7f36b]">Real-Time</div>
                <div className="text-xs text-muted mt-1">Socket.IO streaming</div>
              </div>
              <div>
                <div className="text-2xl font-grotesk font-bold text-white">Zero Config</div>
                <div className="text-xs text-muted mt-1">Memory & BullMQ</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Agent Console Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#13161a] border border-[#2e3744] p-5 shadow-2xl shadow-black relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#262c35]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#fb7185]/80" />
                  <span className="h-3 w-3 rounded-full bg-[#fbbf24]/80" />
                  <span className="h-3 w-3 rounded-full bg-[#c7f36b]/80" />
                </div>
                <span className="text-[11px] font-mono text-muted">AGENT_ORCHESTRATOR.LOG</span>
              </div>

              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#181c22] border border-[#29323f]">
                  <div className="flex items-center justify-between text-muted text-[10px]">
                    <span className="text-[#38bdf8] font-bold">PLANNER</span>
                    <span>00:00.12</span>
                  </div>
                  <p className="text-white mt-1">Topological sort resolved 4 nodes DAG. Confidence: 98%</p>
                </div>

                <div className="p-3 rounded-lg bg-[#181c22] border border-[#29323f]">
                  <div className="flex items-center justify-between text-muted text-[10px]">
                    <span className="text-[#c7f36b] font-bold">EXECUTION</span>
                    <span>00:00.35</span>
                  </div>
                  <p className="text-white mt-1">Evaluated Claude 3.5 prompt & appended row to Google Sheet</p>
                </div>

                <div className="p-3 rounded-lg bg-[#181c22] border border-[#29323f]">
                  <div className="flex items-center justify-between text-muted text-[10px]">
                    <span className="text-[#c084fc] font-bold">VALIDATION</span>
                    <span>00:00.41</span>
                  </div>
                  <p className="text-white mt-1">Output schema verified: [invoiceId, total, status: ok]</p>
                </div>

                <div className="p-3 rounded-lg bg-[#162018] border border-[#2a452d]">
                  <div className="flex items-center justify-between text-muted text-[10px]">
                    <span className="text-[#c7f36b] font-bold">MONITORING</span>
                    <span>00:00.48</span>
                  </div>
                  <p className="text-[#c7f36b] font-semibold mt-1">Pipeline completed successfully (480ms)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Agent Architecture Section */}
        <section className="mt-32 pt-16 border-t border-[#262c35]">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="eyebrow acid">ARCHITECTURE</span>
            <h2 className="font-grotesk text-3xl sm:text-4xl font-bold tracking-tight text-white">
              The 5-Agent Orchestration Chain
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Every workflow undergoes systematic verification, autonomous recovery, and real-time telemetry streaming.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {agentChain.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-[#13161a] border border-[#262c35] hover:border-[#38414e] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted">{agent.num}</span>
                      <Icon size={18} className={agent.color} />
                    </div>
                    <h3 className="font-grotesk font-bold text-sm text-white mt-4">{agent.name}</h3>
                    <p className="text-xs text-muted-light mt-2 leading-relaxed">{agent.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="mt-28 p-8 rounded-2xl bg-[#13161a] border border-[#262c35]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="eyebrow">ECOSYSTEM</span>
              <h3 className="font-grotesk text-2xl font-bold text-white mt-1">
                Connected with Enterprise Integrations
              </h3>
              <p className="text-muted text-xs mt-1">
                OAuth 2.0 with AES-256-GCM token encryption at rest.
              </p>
            </div>
            <Link href="/integrations" className="primary-button small">
              View Integrations <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Gmail', desc: 'Send & Read Mail', color: 'text-[#fb7185]' },
              { name: 'Slack', desc: 'Channels & DMs', color: 'text-[#38bdf8]' },
              { name: 'Discord', desc: 'Bots & Webhooks', color: 'text-[#818cf8]' },
              { name: 'Google Sheets', desc: 'Sync & Append', color: 'text-[#34d399]' },
              { name: 'OpenRouter', desc: 'Claude 3.5 Sonnet', color: 'text-[#c084fc]' },
              { name: 'Gemini SDK', desc: 'Gemini 1.5 Pro', color: 'text-[#fbbf24]' }
            ].map((tool, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#181b21] border border-[#262c35] text-center">
                <div className={`font-grotesk font-bold text-sm ${tool.color}`}>{tool.name}</div>
                <div className="text-[11px] font-mono text-muted mt-1">{tool.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262c35] py-8 text-center text-xs font-mono text-muted">
        <p>Agentflow_AI Operations Automation Platform • Enterprise Agentic Orchestration</p>
      </footer>
    </div>
  );
}
