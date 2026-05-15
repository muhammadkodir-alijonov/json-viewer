import * as Y from 'yjs';
import { v4 as uuidv4 } from 'uuid';
import { Room, ClientInfo, RoomStats, ServerStats, UserColor } from '../types/index.js';
import { logger } from '../utils/logger.js';

const USER_COLORS: UserColor[] = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9',
];

const ADJECTIVES = ['Swift', 'Bright', 'Cool', 'Bold', 'Sharp', 'Quick', 'Smart', 'Calm'];
const ANIMALS = ['Fox', 'Owl', 'Cat', 'Dog', 'Bear', 'Wolf', 'Hawk', 'Lion'];

function generateUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${animal}${num}`;
}

function getRandomColor(): UserColor {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private clients: Map<string, ClientInfo> = new Map();
  private readonly maxRooms: number;
  private readonly maxClientsPerRoom: number;
  private readonly idleTimeout: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.maxRooms = parseInt(process.env.MAX_ROOMS || '1000');
    this.maxClientsPerRoom = parseInt(process.env.MAX_CLIENTS_PER_ROOM || '100');
    this.idleTimeout = parseInt(process.env.ROOM_IDLE_TIMEOUT_MS || '3600000'); // 1 soat

    // Idle roomlarni har 5 minutda tozalash
    this.cleanupInterval = setInterval(() => this.cleanupIdleRooms(), 5 * 60 * 1000);

    logger.info('RoomManager initialized');
  }

  /**
   * Yangi room yaratish
   */
  createRoom(): string {
    if (this.rooms.size >= this.maxRooms) {
      // Eng eski idle roomni o'chirish
      this.evictOldestRoom();
    }

    const roomId = this.generateRoomId();
    const doc = new Y.Doc();

    // Default JSON content
    const yText = doc.getText('json');
    yText.insert(0, '{\n  \n}');

    const room: Room = {
      id: roomId,
      createdAt: new Date(),
      lastActivity: new Date(),
      clients: new Set(),
      doc,
    };

    this.rooms.set(roomId, room);
    logger.info(`Room created: ${roomId}`);

    return roomId;
  }

  /**
   * Roomga kirish
   */
  joinRoom(
    socketId: string,
    roomId: string
  ): { success: boolean; error?: string; initialState?: Uint8Array } {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.clients.size >= this.maxClientsPerRoom) {
      return { success: false, error: 'Room is full' };
    }

    // Oldingi roomdan chiqarish (agar boshqa roomda bo'lsa)
    const client = this.clients.get(socketId);
    if (client?.roomId) {
      this.leaveRoom(socketId);
    }

    room.clients.add(socketId);
    room.lastActivity = new Date();

    // Client info yangilash
    this.updateClientRoom(socketId, roomId);

    // Yjs state encode qilish
    const doc = room.doc as Y.Doc;
    const initialState = Y.encodeStateAsUpdate(doc);

    logger.debug(`Client ${socketId} joined room ${roomId} (${room.clients.size} clients)`);

    return { success: true, initialState };
  }

  /**
   * Roomdan chiqish
   */
  leaveRoom(socketId: string): string | null {
    const client = this.clients.get(socketId);
    if (!client?.roomId) return null;

    const roomId = client.roomId;
    const room = this.rooms.get(roomId);

    if (room) {
      room.clients.delete(socketId);
      room.lastActivity = new Date();
      logger.debug(`Client ${socketId} left room ${roomId} (${room.clients.size} clients)`);

      // Agar room bo'sh bo'lsa va 1 soatdan ko'p o'tgan bo'lsa — o'chirish
      if (room.clients.size === 0) {
        const age = Date.now() - room.createdAt.getTime();
        if (age > this.idleTimeout) {
          this.deleteRoom(roomId);
        }
      }
    }

    client.roomId = null;
    return roomId;
  }

  /**
   * Client disconnect bo'lganda
   */
  disconnectClient(socketId: string): string | null {
    const roomId = this.leaveRoom(socketId);
    this.clients.delete(socketId);
    return roomId;
  }

  /**
   * Yjs update ni apply qilish
   */
  applyUpdate(roomId: string, update: Uint8Array): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const doc = room.doc as Y.Doc;
    Y.applyUpdate(doc, update);
    room.lastActivity = new Date();

    return true;
  }

  /**
   * Room state ni olish
   */
  getRoomState(roomId: string): Uint8Array | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const doc = room.doc as Y.Doc;
    return Y.encodeStateAsUpdate(doc);
  }

  /**
   * Room clientlarini olish
   */
  getRoomClients(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.clients) : [];
  }

  /**
   * Client info yaratish yoki olish
   */
  getOrCreateClient(socketId: string): ClientInfo {
    if (!this.clients.has(socketId)) {
      const client: ClientInfo = {
        id: socketId,
        roomId: null,
        connectedAt: new Date(),
        color: getRandomColor(),
        name: generateUsername(),
      };
      this.clients.set(socketId, client);
    }
    return this.clients.get(socketId)!;
  }

  /**
   * Client info olish
   */
  getClient(socketId: string): ClientInfo | undefined {
    return this.clients.get(socketId);
  }

  /**
   * Room mavjudligini tekshirish
   */
  roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  /**
   * Room statistikasini olish
   */
  getRoomStats(roomId: string): RoomStats | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      roomId: room.id,
      clientCount: room.clients.size,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
    };
  }

  /**
   * Server statistikasini olish
   */
  getServerStats(): ServerStats {
    return {
      totalRooms: this.rooms.size,
      totalClients: this.clients.size,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.rooms.clear();
    this.clients.clear();
    logger.info('RoomManager destroyed');
  }

  // Private methods

  private generateRoomId(): string {
    // 8 xonali unique ID
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id: string;
    do {
      id = Array.from({ length: 8 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    } while (this.rooms.has(id));
    return id;
  }

  private updateClientRoom(socketId: string, roomId: string | null): void {
    const client = this.clients.get(socketId);
    if (client) {
      client.roomId = roomId;
    }
  }

  private deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      (room.doc as Y.Doc).destroy();
      this.rooms.delete(roomId);
      logger.info(`Room deleted: ${roomId}`);
    }
  }

  private evictOldestRoom(): void {
    let oldestRoom: Room | null = null;
    let oldestTime = Date.now();

    for (const room of this.rooms.values()) {
      if (room.clients.size === 0 && room.lastActivity.getTime() < oldestTime) {
        oldestTime = room.lastActivity.getTime();
        oldestRoom = room;
      }
    }

    if (oldestRoom) {
      this.deleteRoom(oldestRoom.id);
      logger.warn(`Evicted idle room: ${oldestRoom.id}`);
    }
  }

  private cleanupIdleRooms(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const room of this.rooms.values()) {
      const idleTime = now - room.lastActivity.getTime();
      if (room.clients.size === 0 && idleTime > this.idleTimeout) {
        this.deleteRoom(room.id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} idle rooms`);
    }
  }
}

export const roomManager = new RoomManager();
