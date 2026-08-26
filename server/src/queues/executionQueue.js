import { runWorkflow } from '../agents/orchestrator.js';
import { env } from '../config/env.js';

let bullQueue = null;

// Initialize BullMQ if Redis URL is supplied
async function initBullMQ() {
  if (!env.redisUrl) return null;
  try {
    const { Queue, Worker } = await import('bullmq');
    const queue = new Queue('workflow-executions', { connection: { url: env.redisUrl } });
    
    new Worker('workflow-executions', async (job) => {
      const { workflow, input, ownerId } = job.data;
      return runWorkflow(workflow, input, ownerId);
    }, { connection: { url: env.redisUrl } });

    console.log('[Queue] BullMQ Redis worker initialized.');
    return queue;
  } catch (err) {
    console.warn(`[Queue] Redis Queue unavailable (${err.message}). Using in-memory async worker queue.`);
    return null;
  }
}

initBullMQ().then(q => { bullQueue = q; });

export class ExecutionQueue {
  async addJob(workflow, input = {}, ownerId = 'user-operator-1') {
    if (bullQueue) {
      const job = await bullQueue.add('execute-workflow', { workflow, input, ownerId });
      return { queueType: 'bullmq', jobId: job.id };
    }

    // Zero-config async execution queue fallback
    // Run asynchronously on next event loop tick
    setImmediate(() => {
      runWorkflow(workflow, input, ownerId).catch(err => {
        console.error('[ExecutionQueue] Async run error:', err);
      });
    });

    return { queueType: 'memory-async', status: 'QUEUED' };
  }
}

export const executionQueue = new ExecutionQueue();
