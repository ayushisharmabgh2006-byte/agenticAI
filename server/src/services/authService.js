import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { memory } from '../config/db.js';
import { env } from '../config/env.js';

export class AuthService {
  generateToken(user) {
    return jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role, name: user.name },
      env.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  async register({ name, email, password, role = 'operator' }) {
    const existing = memory.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('EMAIL_EXISTS: An account with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = `user-${Date.now()}`;
    const user = {
      id: userId,
      _id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'operator',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    memory.users.push(user);
    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async login({ email, password }) {
    const user = memory.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('INVALID_CREDENTIALS: Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('INVALID_CREDENTIALS: Invalid email or password.');
    }

    user.lastLogin = new Date().toISOString();
    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getUserById(userId) {
    const user = memory.users.find(u => u.id === userId || u._id === userId);
    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
