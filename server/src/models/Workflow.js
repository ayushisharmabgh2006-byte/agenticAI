let WorkflowModel = null;
try {
  const mongooseModule = await import('mongoose');
  const mongoose = mongooseModule.default || mongooseModule;
  const workflowSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: String, required: true },
    status: { type: String, enum: ['draft', 'active', 'paused', 'archived'], default: 'draft' },
    triggerConfig: {
      type: { type: String, default: 'manual' },
      event: { type: String },
      schedule: { type: String },
      endpoint: { type: String }
    },
    nodes: { type: Array, default: [] },
    edges: { type: Array, default: [] },
    version: { type: Number, default: 1 },
    tags: { type: [String], default: [] }
  }, { timestamps: true });

  WorkflowModel = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);
} catch {}

export const Workflow = WorkflowModel;
