let ExecutionModel = null;
try {
  const mongooseModule = await import('mongoose');
  const mongoose = mongooseModule.default || mongooseModule;
  const executionSchema = new mongoose.Schema({
    workflowId: { type: String, required: true },
    workflowSnapshot: { type: Object, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING'
    },
    currentNode: { type: String, default: null },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number, default: 0 },
    inputs: { type: Object, default: {} },
    outputs: { type: Object, default: {} },
    error: { type: Object, default: null },
    retryCount: { type: Number, default: 0 }
  }, { timestamps: true });

  ExecutionModel = mongoose.models.Execution || mongoose.model('Execution', executionSchema);
} catch {}

export const Execution = ExecutionModel;
