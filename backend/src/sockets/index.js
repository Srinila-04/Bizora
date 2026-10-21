import { Server as SocketIOServer } from 'socket.io';
import { setupChatSocket } from './chat.socket.js';
import config from '../config/env.js';
import { allowedOrigins } from '../config/cors.js';
import logger from '../utils/logger.js';

let ioInstance = null;

export const initSockets = (httpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  ioInstance = io;
  setupChatSocket(io);

  logger.info('Socket.IO real-time notification & chat system initialized');
  return io;
};

export const getIO = () => ioInstance;

export const emitToConversation = (conversationId, event, data) => {
  if (ioInstance && conversationId) {
    ioInstance.to(`conversation:${conversationId}`).emit(event, data);
  }
};

export const emitToUser = (userId, event, data) => {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToBusiness = (businessId, event, data) => {
  if (ioInstance && businessId) {
    ioInstance.to(`business:${businessId}`).emit(event, data);
  }
};

export default {
  initSockets,
  getIO,
  emitToConversation,
  emitToUser,
  emitToBusiness
};

