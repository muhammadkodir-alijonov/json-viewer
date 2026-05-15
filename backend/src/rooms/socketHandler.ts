import { Server, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '../types/index.js';
import { roomManager } from './roomManager.js';
import { SocketRateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const syncRateLimiter = new SocketRateLimiter(100, 1000);   // 100 updates/sec
const awarenessRateLimiter = new SocketRateLimiter(30, 1000); // 30 awareness/sec

export function setupSocketHandlers(io: AppServer): void {
  io.on('connection', (socket: AppSocket) => {
    const clientInfo = roomManager.getOrCreateClient(socket.id);
    logger.info(`Client connected: ${socket.id} (${clientInfo.name})`);

    // ─── Room Events ───────────────────────────────────────────────

    socket.on('room:create', (callback) => {
      try {
        const roomId = roomManager.createRoom();
        logger.info(`Room created by ${socket.id}: ${roomId}`);
        callback(roomId);
      } catch (err) {
        logger.error(`Error creating room: ${err}`);
        socket.emit('room:error', { message: 'Failed to create room' });
      }
    });

    socket.on('room:join', (roomId, callback) => {
      try {
        if (!roomId || typeof roomId !== 'string') {
          return callback(false, 'Invalid room ID');
        }

        const result = roomManager.joinRoom(socket.id, roomId);

        if (!result.success) {
          return callback(false, result.error);
        }

        // Socket.io room ga qo'shish
        socket.join(roomId);

        // Boshqa clientlarga xabar berish
        socket.to(roomId).emit('room:joined', {
          roomId,
          clientId: socket.id,
          clients: roomManager.getRoomClients(roomId),
        });

        // Initial Yjs state yuborish
        if (result.initialState) {
          socket.emit('sync:state', result.initialState);
        }

        const stats = roomManager.getRoomStats(roomId);
        logger.info(`Client ${socket.id} joined room ${roomId} (${stats?.clientCount} total)`);

        callback(true);
      } catch (err) {
        logger.error(`Error joining room ${roomId}: ${err}`);
        callback(false, 'Failed to join room');
      }
    });

    socket.on('room:leave', () => {
      handleLeave(socket, io);
    });

    // ─── Yjs Sync Events ───────────────────────────────────────────

    socket.on('sync:update', (update: Uint8Array) => {
      if (!syncRateLimiter.isAllowed(socket.id)) {
        logger.warn(`Rate limit exceeded for sync:update from ${socket.id}`);
        return;
      }

      const client = roomManager.getClient(socket.id);
      if (!client?.roomId) return;

      const success = roomManager.applyUpdate(client.roomId, update);

      if (success) {
        // Boshqa clientlarga broadcast qilish
        socket.to(client.roomId).emit('sync:update', update);
      }
    });

    socket.on('sync:request-state', () => {
      const client = roomManager.getClient(socket.id);
      if (!client?.roomId) return;

      const state = roomManager.getRoomState(client.roomId);
      if (state) {
        socket.emit('sync:state', state);
      }
    });

    // ─── Awareness Events (cursors, selections) ────────────────────

    socket.on('awareness:update', (update: Uint8Array) => {
      if (!awarenessRateLimiter.isAllowed(socket.id)) return;

      const client = roomManager.getClient(socket.id);
      if (!client?.roomId) return;

      socket.to(client.roomId).emit('awareness:update', update);
    });

    socket.on('cursor:update', (cursor) => {
      const client = roomManager.getClient(socket.id);
      if (!client?.roomId) return;

      socket.to(client.roomId).emit('cursor:update', {
        clientId: socket.id,
        cursor,
      });
    });

    // ─── Disconnect ────────────────────────────────────────────────

    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id} (${reason})`);
      handleLeave(socket, io);
      roomManager.disconnectClient(socket.id);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error for ${socket.id}: ${err.message}`);
    });
  });

  // Server stats har 30 sekundda broadcast
  setInterval(() => {
    const stats = roomManager.getServerStats();
    io.emit('server:stats', stats);
  }, 30000);

  logger.info('Socket handlers initialized');
}

function handleLeave(socket: AppSocket, io: AppServer): void {
  const client = roomManager.getClient(socket.id);
  if (!client?.roomId) return;

  const roomId = client.roomId;
  roomManager.leaveRoom(socket.id);
  socket.leave(roomId);

  // Boshqa clientlarga xabar
  io.to(roomId).emit('room:left', { clientId: socket.id });

  logger.debug(`Client ${socket.id} left room ${roomId}`);
}
