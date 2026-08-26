import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance && typeof window !== 'undefined') {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to Agentflow Real-Time Socket.IO Server');
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from Real-Time Socket.IO Server');
    });
  }
  return socketInstance;
}

export function subscribeToExecution(executionId, { onLog, onStatus }) {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.emit('join:execution', executionId);

  const handleLog = (log) => {
    if (log.executionId === executionId && onLog) onLog(log);
  };

  const handleStatus = (status) => {
    if (onStatus) onStatus(status);
  };

  socket.on('execution:log', handleLog);
  socket.on('execution:status', handleStatus);

  return () => {
    socket.emit('leave:execution', executionId);
    socket.off('execution:log', handleLog);
    socket.off('execution:status', handleStatus);
  };
}

export function subscribeToNotifications(userId, onNotification) {
  const socket = getSocket();
  if (!socket) return () => {};

  if (userId) socket.emit('join:user', userId);

  const handleNotif = (notif) => {
    if (onNotification) onNotification(notif);
  };

  socket.on('notification:new', handleNotif);

  return () => {
    socket.off('notification:new', handleNotif);
  };
}
