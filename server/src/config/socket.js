import { Server } from 'socket.io';
import { env } from './env.js';

let ioInstance = null;

export function createSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
      }
    });

    socket.on('leave:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
      }
    });

    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });
  });

  ioInstance = io;
  return io;
}

export function getSocket() {
  return ioInstance;
}

export function emitExecutionLog(executionId, log) {
  if (!ioInstance) return;
  ioInstance.to(`execution:${executionId}`).emit('execution:log', log);
  ioInstance.emit('global:log', log);
}

export function emitExecutionStatus(executionId, data) {
  if (!ioInstance) return;
  ioInstance.to(`execution:${executionId}`).emit('execution:status', data);
  ioInstance.emit('global:status', { executionId, ...data });
}

export function emitNotification(userId, notification) {
  if (!ioInstance) return;
  if (userId) {
    ioInstance.to(`user:${userId}`).emit('notification:new', notification);
  }
  ioInstance.emit('notification:new', notification);
}
