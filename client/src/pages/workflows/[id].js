import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Workflow,
  Save,
  Play,
  Copy,
  Trash2,
  ArrowLeft,
  Loader2,
  Check,
  Download,
  Upload,
  Layers,
  Sparkles,
  Settings,
  Share2
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodePalette from '../../components/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel';
import ExecutionModal from '../../components/ExecutionModal';
import { useWorkflowStore } from '../../store/workflowStore';
import { api } from '../../services/api';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    currentWorkflow,
    selectedNode,
    fetchWorkflow,
    setCurrentWorkflow,
    setSelectedNode,
    updateNodeData,
    addNode,
    saveWorkflow,
    isLoading
  } = useWorkflowStore();

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExecutionOpen, setIsExecutionOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkflow(id);
    }
  }, [id]);

  const handleSave = async () => {
    if (!currentWorkflow) return;
    setSaving(true);
    try {
      await saveWorkflow(currentWorkflow);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert('Failed to save workflow changes');
    } finally {
      setSaving(false);
    }
  };

  const handleNodeSelect = useCallback((node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const handleDeleteNode = (nodeId) => {
    if (!currentWorkflow) return;
    const filteredNodes = currentWorkflow.nodes.filter(n => n.id !== nodeId);
    const filteredEdges = currentWorkflow.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    setCurrentWorkflow({
      ...currentWorkflow,
      nodes: filteredNodes,
      edges: filteredEdges
    });
    setSelectedNode(null);
  };

  const handleNodesChangeParent = (changes) => {
    // Keep local store in sync with canvas drags
  };

  const handleExportJson = () => {
    if (!currentWorkflow) return;
    const blob = new Blob([JSON.stringify(currentWorkflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkflow.name.replace(/\s+/g, '_').toLowerCase()}_v${currentWorkflow.version || 1}.json`;
    a.click();
  };

  if (isLoading || !currentWorkflow) {
    return (
      <ProtectedRoute>
        <AppShell activeTitle="Workflow Studio">
          <div className="h-[70vh] flex flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin text-[#a855f7] mb-3" size={32} />
            <p className="text-xs font-mono text-muted">Loading visual workflow DAG...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell activeTitle={currentWorkflow.name || 'Workflow Studio'}>
        <div className="h-[calc(100vh-140px)] flex flex-col -m-6 sm:-m-10">
          {/* Top Canvas Toolbar */}
          <div className="h-14 bg-[#13161a] border-b border-[#262c35] px-6 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-4">
              <Link
                href="/workflows"
                className="p-1.5 rounded-lg hover:bg-[#1b1f26] text-muted hover:text-white transition-colors"
                title="Back to Workflows"
              >
                <ArrowLeft size={17} />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-grotesk font-bold text-sm text-white">
                    {currentWorkflow.name}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181c22] border border-[#262c35] text-[#a855f7]">
                    v{currentWorkflow.version || 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportJson}
                className="secondary-button small !py-1.5 !px-2.5"
                title="Export JSON"
              >
                <Download size={14} /> Export
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="secondary-button small !py-1.5"
              >
                {saving ? <Loader2 className="animate-spin" size={14} /> : saveSuccess ? <Check size={14} className="text-[#a855f7]" /> : <Save size={14} />} 
                <span>{saveSuccess ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => setIsExecutionOpen(true)}
                className="primary-button small !py-1.5"
              >
                <Play size={14} /> Execute Run
              </button>
            </div>
          </div>

          {/* Main 3-Column Studio Workspace */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Column: Node Palette */}
            <NodePalette onAddNode={addNode} />

            {/* Center: React Flow Canvas */}
            <div className="flex-1 h-full relative">
              <WorkflowCanvas
                nodes={currentWorkflow.nodes || []}
                edges={currentWorkflow.edges || []}
                onNodeSelect={handleNodeSelect}
                onNodesChangeParent={handleNodesChangeParent}
              />
            </div>

            {/* Right Column: Node Config Panel Inspector */}
            {selectedNode && (
              <NodeConfigPanel
                node={selectedNode}
                onUpdateNode={updateNodeData}
                onDeleteNode={handleDeleteNode}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </div>

          {/* Live Execution Modal */}
          <ExecutionModal
            workflow={currentWorkflow}
            isOpen={isExecutionOpen}
            onClose={() => setIsExecutionOpen(false)}
          />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
