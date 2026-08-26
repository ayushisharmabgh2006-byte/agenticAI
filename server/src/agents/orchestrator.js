import { memory } from '../config/db.js';
import { emitExecutionLog, emitExecutionStatus, emitNotification } from '../config/socket.js';
import { plannerAgent } from './plannerAgent.js';
import { executionAgent } from './executionAgent.js';
import { validationAgent } from './validationAgent.js';
import { recoveryAgent } from './recoveryAgent.js';
import { monitoringAgent } from './monitoringAgent.js';

const activeExecutionControls = new Map();

export async function pauseExecution(executionId) {
  const ctrl = activeExecutionControls.get(executionId);
  if (ctrl) ctrl.isPaused = true;
  const exec = memory.executions.find(e => e.id === executionId);
  if (exec && exec.status === 'RUNNING') {
    exec.status = 'PAUSED';
    emitExecutionStatus(executionId, { status: 'PAUSED' });
  }
  return exec;
}

export async function resumeExecution(executionId) {
  const ctrl = activeExecutionControls.get(executionId);
  if (ctrl) ctrl.isPaused = false;
  const exec = memory.executions.find(e => e.id === executionId);
  if (exec && exec.status === 'PAUSED') {
    exec.status = 'RUNNING';
    emitExecutionStatus(executionId, { status: 'RUNNING' });
  }
  return exec;
}

export async function cancelExecution(executionId) {
  const ctrl = activeExecutionControls.get(executionId);
  if (ctrl) ctrl.isCancelled = true;
  const exec = memory.executions.find(e => e.id === executionId);
  if (exec) {
    exec.status = 'CANCELLED';
    exec.endTime = new Date().toISOString();
    exec.duration = Date.parse(exec.endTime) - Date.parse(exec.startTime);
    emitExecutionStatus(executionId, { status: 'CANCELLED' });
  }
  return exec;
}

export async function runWorkflow(workflow, input = {}, ownerId = 'user-operator-1') {
  const executionId = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startTime = new Date().toISOString();

  const execution = {
    id: executionId,
    _id: executionId,
    workflowId: workflow.id || workflow._id || 'unknown-wf',
    workflowSnapshot: structuredClone(workflow),
    status: 'RUNNING',
    currentNode: null,
    startTime,
    endTime: null,
    duration: 0,
    inputs: input || {},
    outputs: {},
    error: null,
    retryCount: 0,
    createdAt: startTime
  };

  memory.executions.unshift(execution);

  const control = { isPaused: false, isCancelled: false };
  activeExecutionControls.set(executionId, control);

  function logEvent(agent, level, message, metadata = {}, nodeId = null) {
    const log = monitoringAgent.createLog({
      executionId,
      workflowId: execution.workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata
    });
    memory.executionLogs.push(log);
    emitExecutionLog(executionId, log);
    return log;
  }

  try {
    emitExecutionStatus(executionId, { status: 'RUNNING', currentNode: null });

    // Step 1: PLANNER AGENT
    logEvent('planner', 'info', 'Analyzing workflow graph topology and dependencies...');
    const planResult = await plannerAgent.plan(workflow, input);

    if (!planResult.success) {
      throw new Error(planResult.error || 'Failed to construct workflow plan');
    }

    logEvent('planner', 'success', `Plan validated. Confidence score: ${(planResult.confidenceScore * 100).toFixed(0)}%. Resolved ${planResult.order.length} execution steps.`, {
      confidenceScore: planResult.confidenceScore,
      order: planResult.order
    });

    const executionContext = {
      input,
      steps: {}
    };

    // Step 2 & 3: EXECUTION & VALIDATION AGENTS FOR EACH NODE
    const nodeMap = new Map((workflow.nodes || []).map(n => [n.id, n]));

    for (const nodeId of planResult.order) {
      // Check for cancellation
      if (control.isCancelled) {
        logEvent('monitoring', 'warning', 'Execution was cancelled by operator.');
        execution.status = 'CANCELLED';
        break;
      }

      // Check for pause
      while (control.isPaused && !control.isCancelled) {
        await new Promise(r => setTimeout(r, 500));
      }

      const node = nodeMap.get(nodeId);
      if (!node) continue;

      execution.currentNode = nodeId;
      emitExecutionStatus(executionId, { status: 'RUNNING', currentNode: nodeId });

      const nodeLabel = node.data?.label || nodeId;
      logEvent('execution', 'info', `Executing node [${nodeLabel}]...`, { nodeId, type: node.type }, nodeId);

      // Add a slight realistic micro-pause for smooth real-time visual UI feel (200ms)
      await new Promise(r => setTimeout(r, 220));

      let nodeResult;
      try {
        nodeResult = await executionAgent.executeNode(node, executionContext, ownerId);
      } catch (nodeError) {
        // Step 4: RECOVERY AGENT on error
        const classification = recoveryAgent.classifyFailure(nodeError, execution.retryCount);
        logEvent('recovery', 'warning', `Failure detected at node [${nodeLabel}]: ${nodeError.message || nodeError.code}. Recovery decision: ${classification.action}.`, {
          classification,
          error: nodeError
        }, nodeId);

        if (classification.action === 'retry_with_backoff' && execution.retryCount < 2) {
          execution.retryCount++;
          execution.status = 'RETRYING';
          emitExecutionStatus(executionId, { status: 'RETRYING', retryCount: execution.retryCount });
          logEvent('recovery', 'info', `Retrying node in ${classification.delayMs}ms (Attempt ${execution.retryCount})...`, {}, nodeId);
          await new Promise(r => setTimeout(r, Math.min(classification.delayMs, 1000)));
          nodeResult = await executionAgent.executeNode(node, executionContext, ownerId);
        } else {
          throw nodeError;
        }
      }

      // Step 3: VALIDATION AGENT
      const valResult = await validationAgent.validateNodeOutput(node, nodeResult);
      if (!valResult.valid) {
        logEvent('validation', 'warning', `Validation warning: ${valResult.message}`, { valResult }, nodeId);
      } else {
        logEvent('validation', 'info', `Validation passed for node [${nodeLabel}].`, { fieldsChecked: valResult.fieldsChecked }, nodeId);
      }

      executionContext.steps[nodeId] = nodeResult.output;
      executionContext[nodeId] = nodeResult.output;
      if (node.type === 'trigger') {
        executionContext.trigger = nodeResult;
      }

      logEvent('execution', 'success', `Node [${nodeLabel}] completed successfully.`, { outputSnippet: nodeResult.output }, nodeId);
    }

    if (execution.status !== 'CANCELLED') {
      execution.status = 'COMPLETED';
      execution.outputs = executionContext.steps;
    }
  } catch (error) {
    execution.status = 'FAILED';
    execution.error = {
      message: error.message || 'Execution error encountered',
      code: error.code || 'EXECUTION_FAILED',
      stack: error.stack
    };
    logEvent('monitoring', 'error', `Execution failed: ${error.message || 'Unknown error'}`, { error: execution.error });
  } finally {
    execution.currentNode = null;
    execution.endTime = new Date().toISOString();
    execution.duration = Date.parse(execution.endTime) - Date.parse(execution.startTime);
    activeExecutionControls.delete(executionId);

    // Monitoring agent final log
    logEvent('monitoring', execution.status === 'COMPLETED' ? 'success' : 'info', `Workflow finished with status ${execution.status} in ${execution.duration}ms.`, {
      langGraph: 'not-installed',
      duration: execution.duration,
      retryCount: execution.retryCount
    });

    emitExecutionStatus(executionId, {
      status: execution.status,
      duration: execution.duration,
      outputs: execution.outputs,
      error: execution.error
    });

    // Create notification for operator
    const notif = {
      id: `notif-${Date.now()}`,
      _id: `notif-${Date.now()}`,
      owner: ownerId,
      workflowId: execution.workflowId,
      executionId: execution.id,
      type: execution.status === 'COMPLETED' ? 'success' : execution.status === 'CANCELLED' ? 'warning' : 'error',
      title: execution.status === 'COMPLETED' ? 'Workflow Run Completed' : 'Workflow Run Alert',
      message: `Workflow "${workflow.name || 'Untitled'}" finished with status ${execution.status} (${execution.duration}ms).`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    memory.notifications.unshift(notif);
    emitNotification(ownerId, notif);
  }

  return execution;
}
