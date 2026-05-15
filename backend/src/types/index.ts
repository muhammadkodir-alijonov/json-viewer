export interface Room {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  clients: Set<string>;
  doc: unknown; // Yjs Doc
}

export interface ClientInfo {
  id: string;
  roomId: string | null;
  connectedAt: Date;
  color: string;
  name: string;
}

export interface JsonValidationResult {
  valid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
    position?: number;
  };
  size?: number;
  depth?: number;
  keyCount?: number;
}

export interface JsonFormatOptions {
  indent?: number;
  sortKeys?: boolean;
}

export interface RoomStats {
  roomId: string;
  clientCount: number;
  createdAt: Date;
  lastActivity: Date;
}

export interface ServerStats {
  totalRooms: number;
  totalClients: number;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
}

// Socket.io event types
export interface ServerToClientEvents {
  'room:joined': (data: { roomId: string; clientId: string; clients: string[] }) => void;
  'room:left': (data: { clientId: string }) => void;
  'room:error': (data: { message: string }) => void;
  'sync:update': (update: Uint8Array) => void;
  'sync:state': (state: Uint8Array) => void;
  'awareness:update': (update: Uint8Array) => void;
  'cursor:update': (data: { clientId: string; cursor: CursorPosition }) => void;
  'server:stats': (stats: ServerStats) => void;
}

export interface ClientToServerEvents {
  'room:create': (callback: (roomId: string) => void) => void;
  'room:join': (roomId: string, callback: (success: boolean, error?: string) => void) => void;
  'room:leave': () => void;
  'sync:update': (update: Uint8Array) => void;
  'sync:request-state': () => void;
  'awareness:update': (update: Uint8Array) => void;
  'cursor:update': (cursor: CursorPosition) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  clientInfo: ClientInfo;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export type UserColor =
  | '#FF6B6B'
  | '#4ECDC4'
  | '#45B7D1'
  | '#96CEB4'
  | '#FFEAA7'
  | '#DDA0DD'
  | '#98D8C8'
  | '#F7DC6F'
  | '#BB8FCE'
  | '#85C1E9';
