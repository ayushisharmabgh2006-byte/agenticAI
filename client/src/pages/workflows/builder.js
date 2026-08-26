import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Bot,
  GitBranch,
  Loader2,
  Play,
  Save,
  CheckCircle2,
  Zap,
  ChevronRight,
  Send,
  Layers
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import ExecutionModal from '../../components/ExecutionModal';
import { api } from '../../services/api';
import { useWorkflowStore } from '../../store/workflowStore';

const PROMPT_SUGGESTIONS = [
  'When an incoming invoice arrives via Gmail, extract the line items and total with AI, append to Google Sheets, and notify Slack.',
  'Analyze customer support tickets for sentiment and urgency, escalate critical issues to Discord, and auto-reply via Gmail.',
  'When a new lead fills out a webhook form, qualify the prospect with AI, calculate lead score, and log into Google Sheets.'
];

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const { saveWorkflow } = useWorkflowStore();

  const [prompt, setPrompt] = useState(
    'When a new invoice arrives via Webhook, analyze the vendor total with AI, append to Google Sheets ledger, and notify the finance channel in Slack'
  );
  const [loading, setLoading] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeRunWorkflow, setActiveRunWorkflow] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/workflows/generate', { prompt });
      setGeneratedWorkflow(data);
    } catch (err) {
      console.error('Error generating workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndOpen = async () => {
    if (!generatedWorkflow) return;
    setSaving(true);
    try {
      const saved = await saveWorkflow(generatedWorkflow);
      if (saved?.id) {
        router.push(`/workflows/${saved.id}`);
      }
    } catch (err) {
      alert('Failed to save generated workflow');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell activeTitle="AI Studio">
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-[#13161a] border border-[#262c35] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#c084fc]">
                <Sparkles size={14} />
                <span>NATURAL INTENT SYNTHESIS</span>
              </div>
              <h2 className="font-grotesk text-2xl font-bold text-white mt-1">
                Prompt-to-Workflow Generator
              </h2>
              <p className="text-xs text-muted font-mono mt-0.5">
                Multi-agent cascade: OpenRouter → Gemini SDK → Deterministic Graph Engine
              </p>
            </div>

            {generatedWorkflow && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveRunWorkflow(generatedWorkflow)}
                  className="secondary-button small"
                >
                  <Play size={14} className="text-[#c7f36b]" /> Test Run
                </button>
                <button
                  onClick={handleSaveAndOpen}
                  disabled={saving}
                  className="primary-button small"
                >
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  <span>Save & Open Studio</span>
                </button>
              </div>
            )}
          </div>

          {/* Builder Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Prompt Input Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="card-panel space-y-4">
                <div>
                  <label className="block text-xs font-mono text-muted mb-2 font-semibold">
                    Describe your desired automation
                  </label>
                  <textarea
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. When a support email arrives, summarize sentiment and notify Slack..."
                    className="w-full bg-[#181b21] border border-[#262c35] rounded-xl p-4 text-xs text-white leading-relaxed resize-none focus:outline-none focus:border-[#c7f36b] font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-muted">
                    Supports tools: Gmail, Slack, Discord, Sheets
                  </span>
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="primary-button small"
                  >
                    {loading ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />}
                    {loading ? 'Synthesizing...' : 'Generate Graph'}
                  </button>
                </div>
              </div>

              {/* Starter Suggestions */}
              <div className="card-panel">
                <span className="eyebrow block mb-3">CURATED TEMPLATE PROMPTS</span>
                <div className="space-y-2">
                  {PROMPT_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(s)}
                      className="w-full p-3 rounded-xl bg-[#171a1f] hover:bg-[#1f242c] border border-[#262c35] text-left text-xs text-muted-light hover:text-white transition-all flex items-center justify-between group leading-relaxed"
                    >
                      <span className="line-clamp-2">{s}</span>
                      <ArrowRight size={13} className="text-muted group-hover:text-[#c7f36b] shrink-0 ml-2 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Graph Preview Panel */}
            <div className="lg:col-span-7">
              <div className="card-panel h-[600px] flex flex-col p-0 overflow-hidden">
                <div className="p-4 border-b border-[#262c35] flex items-center justify-between bg-[#13161a]">
                  <div>
                    <span className="eyebrow">CANVAS PREVIEW</span>
                    <h3 className="font-grotesk font-bold text-sm text-white mt-0.5">
                      {generatedWorkflow?.name || 'Generated Graph Canvas'}
                    </h3>
                  </div>

                  {generatedWorkflow && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#181c22] border border-[#262c35] text-[#c7f36b]">
                        Mode: {generatedWorkflow.generationMode || 'deterministic'}
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#181c22] border border-[#262c35] text-muted">
                        {generatedWorkflow.nodes?.length || 0} nodes
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full relative">
                  {generatedWorkflow ? (
                    <WorkflowCanvas
                      nodes={generatedWorkflow.nodes || []}
                      edges={generatedWorkflow.edges || []}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted bg-[#0c0e12]">
                      <div className="h-12 w-12 rounded-2xl bg-[#171a1f] border border-[#262c35] grid place-items-center text-[#c7f36b] mb-3">
                        <Sparkles size={24} />
                      </div>
                      <h4 className="font-grotesk font-bold text-base text-white">Graph Not Yet Generated</h4>
                      <p className="text-xs font-mono text-muted/70 mt-1 max-w-sm">
                        Submit a natural language prompt to materialize your visual workflow DAG.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <ExecutionModal
            workflow={activeRunWorkflow}
            isOpen={Boolean(activeRunWorkflow)}
            onClose={() => setActiveRunWorkflow(null)}
          />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
