let UserModel = null;
try {
  const mongooseModule = await import('mongoose');
  const mongoose = mongooseModule.default || mongooseModule;
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'operator'], default: 'operator' },
    lastLogin: { type: Date }
  }, { timestamps: true });

  UserModel = mongoose.models.User || mongoose.model('User', userSchema);
} catch {}

export const User = UserModel;
