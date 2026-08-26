let AgentMemoryModel = null;
try {
  const mongooseModule = await import('mongoose');
  const mongoose = mongooseModule.default || mongooseModule;
  const agentMemorySchema = new mongoose.Schema({
    workflowId: { type: String, required: true },
    executionId: { type: String, required: true },
    agentId: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    confidenceScore: { type: Number, default: 1.0 }
  }, { timestamps: true });

  AgentMemoryModel = mongoose.models.AgentMemory || mongoose.model('AgentMemory', agentMemorySchema);
} catch {}

export const AgentMemory = AgentMemoryModel;
