export interface ClientInfo {
  id: string;
  name: string;
  color: string;
}

export interface RoomState {
  roomId: string | null;
  clients: ClientInfo[];
  connected: boolean;
  synced: boolean;
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

export interface JsonAnalysis extends JsonValidationResult {
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'invalid';
  charCount?: number;
  lineCount?: number;
}

export type EditorTheme = 'vs-dark' | 'light';

export type PanelLayout = 'split' | 'editor-only' | 'tree-only';

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  theme: EditorTheme;
}

export interface TreeNode {
  key: string;
  value: unknown;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  path: string;
  depth: number;
  isExpanded?: boolean;
  children?: TreeNode[];
}

// Socket events
export interface ServerToClientEvents {
  'room:joined': (data: { roomId: string; clientId: string; clients: string[] }) => void;
  'room:left': (data: { clientId: string }) => void;
  'room:error': (data: { message: string }) => void;
  'sync:update': (update: Uint8Array) => void;
  'sync:state': (state: Uint8Array) => void;
  'awareness:update': (update: Uint8Array) => void;
}

export interface ClientToServerEvents {
  'room:create': (callback: (roomId: string) => void) => void;
  'room:join': (roomId: string, callback: (success: boolean, error?: string) => void) => void;
  'room:leave': () => void;
  'sync:update': (update: Uint8Array) => void;
  'sync:request-state': () => void;
  'awareness:update': (update: Uint8Array) => void;
}
