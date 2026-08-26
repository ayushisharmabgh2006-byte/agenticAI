import { workflowService } from '../services/workflowService.js';
import { generateWorkflow as aiGenerate } from '../services/aiService.js';
import { executionService } from '../services/executionService.js';

export async function getDashboard(req, res, next) {
  try {
    const ownerId = req.user?.id;
    const data = await workflowService.getDashboardStats(ownerId);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
}

export async function listWorkflows(req, res, next) {
  try {
    const ownerId = req.user?.id;
    const { search, tag, status } = req.query;
    const workflows = await workflowService.listWorkflows(ownerId, { search, tag, status });
    res.json({ success: true, workflows });
  } catch (error) {
    next(error);
  }
}

export async function createWorkflow(req, res, next) {
  try {
    const ownerId = req.user?.id || 'user-operator-1';
    const workflow = await workflowService.createWorkflow(ownerId, req.body);
    res.status(201).json({ success: true, workflow });
  } catch (error) {
    next(error);
  }
}

export async function generateWorkflow(req, res, next) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'PROMPT_REQUIRED: Prompt string is required.' });
    }
    const generated = await aiGenerate(prompt);
    res.json({ success: true, ...generated });
  } catch (error) {
    next(error);
  }
}

export async function getWorkflow(req, res, next) {
  try {
    const { id } = req.params;
    const workflow = await workflowService.getWorkflowById(id);
    res.json({ success: true, workflow });
  } catch (error) {
    if (error.message.includes('NOT_FOUND')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
}

export async function updateWorkflow(req, res, next) {
  try {
    const { id } = req.params;
    const workflow = await workflowService.updateWorkflow(id, req.body);
    res.json({ success: true, workflow });
  } catch (error) {
    if (error.message.includes('NOT_FOUND')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
}

export async function duplicateWorkflow(req, res, next) {
  try {
    const { id } = req.params;
    const ownerId = req.user?.id || 'user-operator-1';
    const workflow = await workflowService.duplicateWorkflow(id, ownerId);
    res.status(201).json({ success: true, workflow });
  } catch (error) {
    next(error);
  }
}

export async function executeWorkflow(req, res, next) {
  try {
    const { id } = req.params;
    const ownerId = req.user?.id || 'user-operator-1';
    const execution = await executionService.triggerExecution(id, req.body.input || {}, ownerId);
    res.json({ success: true, execution });
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkflow(req, res, next) {
  try {
    const { id } = req.params;
    const result = await workflowService.deleteWorkflow(id);
    res.json(result);
  } catch (error) {
    if (error.message.includes('NOT_FOUND')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
}
