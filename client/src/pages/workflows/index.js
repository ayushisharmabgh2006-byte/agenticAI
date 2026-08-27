import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Workflow,
  Plus,
  Sparkles,
  Search,
  Filter,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  ChevronRight,
  Loader2,
  Tag
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import ExecutionModal from '../../components/ExecutionModal';
import { api } from '../../services/api';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeRunWorkflow, setActiveRunWorkflow] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workflows');
      setWorkflows(data.workflows || []);
    } catch (err) {
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleDuplicate = async (id) => {
    try {
      const { data } = await api.post(`/workflows/${id}/duplicate`);
      loadWorkflows();
    } catch (err) {
      alert('Failed to duplicate workflow');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      loadWorkflows();
    } catch (err) {
      alert('Failed to delete workflow');
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;
    try {
      const { data } = await api.post('/workflows', {
        name: newWorkflowName.trim(),
        description: 'Custom user defined multi-agent workflow',
        status: 'draft',
        tags: ['custom']
      });
      setIsCreating(false);
      setNewWorkflowName('');
      router.push(`/workflows/${data.workflow.id}`);
    } catch (err) {
      alert('Failed to create workflow');
    }
  };

  // Filter workflows
  const filteredWorkflows = workflows.filter(wf => {
    const matchesSearch = !search ||
      wf.name?.toLowerCase().includes(search.toLowerCase()) ||
      wf.description?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || (wf.tags && wf.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(workflows.flatMap(w => w.tags || [])));

  return (
    <ProtectedRoute>
      <AppShell activeTitle="Workflows">
        <div className="space-y-6">
          {/* Top Bar Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search workflows by name or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#13161a] border border-[#262c35] rounded-xl px-4 py-2.5 text-xs text-white pl-10 focus:outline-none focus:border-[#a855f7]"
                />
                <Search size={15} className="absolute left-3.5 top-3 text-muted" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/workflows/builder" className="secondary-button small">
                <Sparkles size={15} className="text-[#c084fc]" /> Generate with AI
              </Link>
              <button
                onClick={() => setIsCreating(true)}
                className="primary-button small"
              >
                <Plus size={15} /> Create Workflow
              </button>
            </div>
          </div>

          {/* Tag Filter Pills */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <span className="text-muted text-[11px] mr-1">Filter by Tag:</span>
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1 rounded-full border transition-all ${
                  selectedTag === ''
                    ? 'bg-[#a855f7] text-ink font-bold border-[#a855f7]'
                    : 'bg-[#14171b] text-muted border-[#262c35] hover:text-white'
                }`}
              >
                All ({workflows.length})
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    selectedTag === tag
                      ? 'bg-[#a855f7] text-ink font-bold border-[#a855f7]'
                      : 'bg-[#14171b] text-muted border-[#262c35] hover:text-white'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Workflows Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-[#a855f7] mx-auto" size={32} />
              <p className="text-xs font-mono text-muted mt-3">Loading automation catalog...</p>
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="py-16 text-center bg-[#13161a] border border-[#262c35] rounded-2xl p-8">
              <Workflow size={36} className="text-muted/40 mx-auto mb-3" />
              <h3 className="font-grotesk font-bold text-lg text-white">No workflows found</h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                Generate a new workflow using natural language or build one from scratch on the canvas.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href="/workflows/builder" className="primary-button small">
                  <Sparkles size={14} /> AI Builder
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorkflows.map((wf) => {
                const nodeCount = wf.nodes?.length || 0;
                return (
                  <div
                    key={wf.id || wf._id}
                    className="p-5 rounded-2xl bg-[#13161a] border border-[#262c35] hover:border-[#38414e] transition-all flex flex-col justify-between group shadow-xl relative"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-[#1b1f26] border border-[#262c35] grid place-items-center text-[#a855f7] group-hover:scale-105 transition-transform">
                            <Workflow size={17} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-muted">v{wf.version || 1} • {nodeCount} nodes</span>
                            <h3 className="font-grotesk font-bold text-sm text-white group-hover:text-[#a855f7] transition-colors line-clamp-1">
                              {wf.name}
                            </h3>
                          </div>
                        </div>

                        <span className={`status-badge ${wf.status}`}>
                          {wf.status}
                        </span>
                      </div>

                      <p className="text-xs text-muted-light mt-3 line-clamp-2 leading-relaxed">
                        {wf.description || 'No description configured for this automated pipeline.'}
                      </p>

                      {/* Tags */}
                      {wf.tags && wf.tags.length > 0 && (
                        <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
                          {wf.tags.map((t, idx) => (
                            <span key={idx} className="text-[10px] font-mono bg-[#181c22] border border-[#262c35] text-muted-light px-2 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="mt-5 pt-4 border-t border-[#262c35] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveRunWorkflow(wf)}
                          title="Execute workflow"
                          className="p-2 rounded-lg bg-[#1a251b] hover:bg-[#233525] border border-[#2d472e] text-[#a855f7] transition-colors"
                        >
                          <Play size={14} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(wf.id || wf._id)}
                          title="Duplicate workflow"
                          className="p-2 rounded-lg hover:bg-[#1b1f26] text-muted hover:text-white transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(wf.id || wf._id)}
                          title="Delete workflow"
                          className="p-2 rounded-lg hover:bg-[#2b181b] text-muted hover:text-[#fb7185] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <Link
                        href={`/workflows/${wf.id || wf._id}`}
                        className="text-xs font-semibold text-white hover:text-[#a855f7] flex items-center gap-1 transition-colors"
                      >
                        Open Studio <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Workflow Modal */}
          {isCreating && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#13161a] border border-[#262c35] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <h3 className="font-grotesk font-bold text-lg text-white">Create New Workflow</h3>
                <p className="text-xs text-muted font-mono">Initialize a blank canvas for visual authoring.</p>

                <form onSubmit={handleCreateManual} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-muted mb-1.5">Workflow Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lead Router & CRM Sync"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                      className="w-full bg-[#181b21] border border-[#262c35] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="secondary-button small"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-button small"
                    >
                      Initialize Canvas
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Quick Execution Runner Modal */}
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
