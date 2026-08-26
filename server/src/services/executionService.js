import { memory } from '../config/db.js';
import { runWorkflow, pauseExecution as orchestratorPause, resumeExecution as orchestratorResume, cancelExecution as orchestratorCancel } from '../agents/orchestrator.js';
import { workflowService } from './workflowService.js';
import { executionQueue } from '../queues/executionQueue.js';

export class ExecutionService {
  async listExecutions({ workflowId, status, page = 1, limit = 20 } = {}) {
    let list = [...memory.executions];

    if (workflowId) {
      list = list.filter(e => e.workflowId === workflowId);
    }

    if (status) {
      list = list.filter(e => e.status === status);
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      executions: items.map(e => {
        const wf = memory.workflows.find(w => w.id === e.workflowId);
        return {
          ...e,
          workflowName: wf ? wf.name : 'Pipeline'
        };
      }),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit) || 1
      }
    };
  }

  async getExecutionById(id) {
    const execution = memory.executions.find(e => e.id === id || e._id === id);
    if (!execution) throw new Error('EXECUTION_NOT_FOUND: Execution does not exist.');

    const wf = memory.workflows.find(w => w.id === execution.workflowId);
    const logs = memory.executionLogs.filter(l => l.executionId === id);

    return {
      ...execution,
      workflowName: wf ? wf.name : 'Pipeline',
      logs
    };
  }

  async getExecutionTimeline(id) {
    const logs = memory.executionLogs.filter(l => l.executionId === id);
    return logs.sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));
  }

  async triggerExecution(workflowId, input = {}, ownerId = 'user-operator-1') {
    const workflow = await workflowService.getWorkflowById(workflowId);
    // Queue execution
    return runWorkflow(workflow, input, ownerId);
  }

  async pauseExecution(id) {
    return orchestratorPause(id);
  }

  async resumeExecution(id) {
    return orchestratorResume(id);
  }

  async cancelExecution(id) {
    return orchestratorCancel(id);
  }

  async retryExecution(id, ownerId = 'user-operator-1') {
    const execution = await this.getExecutionById(id);
    const workflow = execution.workflowSnapshot || await workflowService.getWorkflowById(execution.workflowId);
    return runWorkflow(workflow, execution.inputs || {}, ownerId);
  }
}

export const executionService = new ExecutionService();
