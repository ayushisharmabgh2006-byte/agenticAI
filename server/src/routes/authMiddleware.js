import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { memory } from '../config/db.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED: Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'UNAUTHORIZED: Token invalid or expired' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, env.jwtSecret);
    } catch {}
  }

  if (!req.user) {
    // Default to seeded operator for zero friction local dev
    req.user = { id: 'user-operator-1', email: 'operator@agentflow.io', role: 'operator', name: 'Alex Rivera' };
  }
  next();
}
