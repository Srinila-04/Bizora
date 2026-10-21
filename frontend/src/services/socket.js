import { io } from 'socket.io-client';

let socketInstance = null;

/**
 * Get the current active socket instance
 */
export const getSocket = () => socketInstance;

/**
 * Initialize or retrieve a connected socket instance with the provided or stored JWT token
 */
export const connectSocket = (explicitToken = null) => {
  const token = explicitToken || localStorage.getItem('bizora_access_token');
  if (!token) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  // If already connected with the same token, reuse
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  socketInstance = io(backendUrl, {
    auth: { token },
    query: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000
  });

  socketInstance.on('connect', () => {
    // console.log('[Socket] Connected to real-time server:', socketInstance.id);
  });

  socketInstance.on('disconnect', (reason) => {
    // console.log('[Socket] Disconnected:', reason);
  });

  socketInstance.on('connect_error', (error) => {
    // console.warn('[Socket] Connection error:', error.message);
  });

  return socketInstance;
};

/**
 * Disconnect and tear down active socket
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default {
  getSocket,
  connectSocket,
  disconnectSocket
};

