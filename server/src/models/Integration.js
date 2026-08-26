let IntegrationModel = null;
try {
  const mongooseModule = await import('mongoose');
  const mongoose = mongooseModule.default || mongooseModule;
  const integrationSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true
    },
    isConnected: { type: Boolean, default: false },
    scopes: { type: [String], default: [] },
    encryptedTokens: { type: String, default: '' },
    expiresAt: { type: Date },
    metadata: { type: Object, default: {} }
  }, { timestamps: true });

  IntegrationModel = mongoose.models.Integration || mongoose.model('Integration', integrationSchema);
} catch {}

export const Integration = IntegrationModel;
