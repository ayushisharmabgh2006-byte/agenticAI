let ExecutionLogModel = null;
try {
  const mongooseModule = await import('mongoose');
  const mongoose = mongooseModule.default || mongooseModule;
  const executionLogSchema = new mongoose.Schema({
    executionId: { type: String, required: true, index: true },
    workflowId: { type: String, required: true, index: true },
    nodeId: { type: String, default: null },
    agent: {
      type: String,
      enum: ['planner', 'execution', 'validation', 'recovery', 'monitoring'],
      required: true
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info'
    },
    message: { type: String, required: true },
    metadata: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
  }, { timestamps: true });

  ExecutionLogModel = mongoose.models.ExecutionLog || mongoose.model('ExecutionLog', executionLogSchema);
} catch {}

export const ExecutionLog = ExecutionLogModel;
