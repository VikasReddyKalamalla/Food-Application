import { Server as SocketIOServer } from 'socket.io';
import { verifyAccessToken } from '../../common/utils/token.util.js';
import { REALTIME_EVENTS } from '../../common/constants/events.js';
import { ROLES } from '../../common/constants/roles.js';
import logger from '../../config/logger.js';
import env from '../../config/env.js';

let ioInstance = null;

/**
 * Initializes and configures Socket.IO server with authentication and room guards
 * @param {import('node:http').Server} httpServer
 */
export const initSocketServer = (httpServer) => {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: env.parsedClientUrls,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // Authentication Middleware for WebSocket Connections
  ioInstance.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication failed: Missing socket token'));
      }

      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  ioInstance.on('connection', (socket) => {
    logger.info(
      { socketId: socket.id, userId: socket.user?.id, role: socket.user?.role },
      'WebSocket client connected'
    );

    // Automatically join user-scoped room
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    // Role-specific broadcast rooms
    if (socket.user?.role === ROLES.ADMIN) {
      socket.join('admin:notifications');
    }

    // Client requests to track an order room
    socket.on(REALTIME_EVENTS.JOIN_ORDER_ROOM, ({ orderId }) => {
      if (!orderId) return;
      // In production, verify user has rights to order before allowing join
      socket.join(`order:${orderId}`);
      logger.debug({ socketId: socket.id, orderId }, 'Client subscribed to order room');
    });

    socket.on(REALTIME_EVENTS.LEAVE_ORDER_ROOM, ({ orderId }) => {
      if (!orderId) return;
      socket.leave(`order:${orderId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'WebSocket client disconnected');
    });
  });

  return ioInstance;
};

/**
 * Safe access to the active Socket.IO server instance
 * @returns {SocketIOServer|null}
 */
export const getIO = () => {
  return ioInstance;
};

/**
 * Helper to emit order updates to authorized rooms
 * @param {string} orderId
 * @param {object} payload
 */
export const emitOrderUpdate = (orderId, payload) => {
  if (!ioInstance) return;
  ioInstance.to(`order:${orderId}`).emit(REALTIME_EVENTS.ORDER_STATUS_UPDATED, {
    orderId,
    ...payload,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Helper to emit delivery driver location to order subscribers
 * @param {string} orderId
 * @param {{ lat: number, lng: number, heading?: number }} location
 */
export const emitDeliveryLocation = (orderId, location) => {
  if (!ioInstance) return;
  ioInstance.to(`order:${orderId}`).emit(REALTIME_EVENTS.DELIVERY_LOCATION_UPDATED, {
    orderId,
    location,
    timestamp: new Date().toISOString(),
  });
};

export default {
  initSocketServer,
  getIO,
  emitOrderUpdate,
  emitDeliveryLocation,
};
