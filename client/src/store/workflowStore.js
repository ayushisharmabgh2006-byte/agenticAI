import { create } from 'zustand';
import { api } from '../services/api';

export const useWorkflowStore = create((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  selectedNode: null,
  executions: [],
  currentExecution: null,
  executionLogs: [],
  notifications: [],
  isNotificationsOpen: false,
  isLoading: false,

  toggleNotifications: () => set(state => ({ isNotificationsOpen: !state.isNotificationsOpen })),
  
  setSelectedNode: (node) => set({ selectedNode: node }),

  fetchWorkflows: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/workflows');
      set({ workflows: data.workflows || [], isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  fetchWorkflow: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/workflows/${id}`);
      set({ currentWorkflow: data.workflow, selectedNode: null, isLoading: false });
      return data.workflow;
    } catch (err) {
      set({ isLoading: false });
      return null;
    }
  },

  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

  updateNodeData: (nodeId, newData) => {
    const { currentWorkflow, selectedNode } = get();
    if (!currentWorkflow) return;

    const updatedNodes = currentWorkflow.nodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          data: {
            ...n.data,
            ...newData,
            config: {
              ...(n.data?.config || {}),
              ...(newData.config || {})
            }
          }
        };
      }
      return n;
    });

    const updatedWf = { ...currentWorkflow, nodes: updatedNodes };
    set({
      currentWorkflow: updatedWf,
      selectedNode: selectedNode?.id === nodeId ? updatedNodes.find(n => n.id === nodeId) : selectedNode
    });
  },

  addNode: (node) => {
    const { currentWorkflow } = get();
    if (!currentWorkflow) return;
    const nodes = [...(currentWorkflow.nodes || []), node];
    set({ currentWorkflow: { ...currentWorkflow, nodes }, selectedNode: node });
  },

  saveWorkflow: async (workflow) => {
    const target = workflow || get().currentWorkflow;
    if (!target) return;
    try {
      if (target.id && !target.id.startsWith('temp-')) {
        const { data } = await api.put(`/workflows/${target.id}`, target);
        set({ currentWorkflow: data.workflow });
        return data.workflow;
      } else {
        const { data } = await api.post('/workflows', target);
        set({ currentWorkflow: data.workflow });
        return data.workflow;
      }
    } catch (err) {
      console.error('Error saving workflow:', err);
      throw err;
    }
  },

  executeWorkflow: async (id, input = {}) => {
    try {
      const { data } = await api.post(`/workflows/${id}/execute`, { input });
      set({ currentExecution: data.execution });
      return data.execution;
    } catch (err) {
      console.error('Error executing workflow:', err);
      throw err;
    }
  },

  fetchNotifications: async () => {
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data.notifications || [] });
    } catch (err) {}
  },

  markAllNotificationsRead: async () => {
    try {
      await api.post('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      }));
    } catch (err) {}
  },

  appendExecutionLog: (log) => {
    set(state => ({
      executionLogs: [...state.executionLogs, log]
    }));
  },

  clearExecutionLogs: () => set({ executionLogs: [] })
}));
