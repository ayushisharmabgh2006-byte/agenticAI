import { authService } from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    if (error.message.includes('EMAIL_EXISTS')) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json({ success: true, ...result });
  } catch (error) {
    if (error.message.includes('INVALID_CREDENTIALS')) {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id || 'user-operator-1';
    const user = await authService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}
