import { executionService } from '../services/executionService.js';

export async function listExecutions(req, res, next) {
  try {
    const { workflowId, status, page, limit } = req.query;
    const result = await executionService.listExecutions({ workflowId, status, page, limit });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getExecution(req, res, next) {
  try {
    const { id } = req.params;
    const execution = await executionService.getExecutionById(id);
    res.json({ success: true, execution });
  } catch (error) {
    if (error.message.includes('NOT_FOUND')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
}

export async function getTimeline(req, res, next) {
  try {
    const { id } = req.params;
    const logs = await executionService.getExecutionTimeline(id);
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
}

export async function pauseExecution(req, res, next) {
  try {
    const { id } = req.params;
    const execution = await executionService.pauseExecution(id);
    res.json({ success: true, execution });
  } catch (error) {
    next(error);
  }
}

export async function resumeExecution(req, res, next) {
  try {
    const { id } = req.params;
    const execution = await executionService.resumeExecution(id);
    res.json({ success: true, execution });
  } catch (error) {
    next(error);
  }
}

export async function cancelExecution(req, res, next) {
  try {
    const { id } = req.params;
    const execution = await executionService.cancelExecution(id);
    res.json({ success: true, execution });
  } catch (error) {
    next(error);
  }
}

export async function retryExecution(req, res, next) {
  try {
    const { id } = req.params;
    const ownerId = req.user?.id || 'user-operator-1';
    const execution = await executionService.retryExecution(id, ownerId);
    res.json({ success: true, execution });
  } catch (error) {
    next(error);
  }
}
