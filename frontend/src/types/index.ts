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
  type?: JsonValueType;
  lineCount?: number;
}

export type JsonValueType =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'invalid';

export type PanelLayout = 'split' | 'editor-only' | 'tree-only';

export interface TreeNode {
  key: string;
  value: unknown;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  path: string;
  depth: number;
  isExpanded?: boolean;
  children?: TreeNode[];
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
}
