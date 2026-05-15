import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TreeNode } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getValueType(
  value: unknown
): 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as 'object' | 'string' | 'number' | 'boolean';
}

export function buildTreeNodes(
  value: unknown,
  key: string = 'root',
  path: string = '',
  depth: number = 0
): TreeNode {
  const type = getValueType(value);
  const currentPath = path ? `${path}.${key}` : key;

  if (type === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    const children = Object.entries(obj).map(([k, v]) =>
      buildTreeNodes(v, k, currentPath, depth + 1)
    );
    return { key, value, type, path: currentPath, depth, children, isExpanded: depth < 2 };
  }

  if (type === 'array') {
    const arr = value as unknown[];
    const children = arr.map((v, i) =>
      buildTreeNodes(v, String(i), currentPath, depth + 1)
    );
    return { key, value, type, path: currentPath, depth, children, isExpanded: depth < 2 };
  }

  return { key, value, type, path: currentPath, depth };
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadJson(content: string, filename = 'data.json'): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateRoomUrl(roomId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/room/${roomId}`;
}

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    string: 'text-green-400',
    number: 'text-blue-400',
    boolean: 'text-yellow-400',
    null: 'text-gray-400',
    object: 'text-purple-400',
    array: 'text-orange-400',
  };
  return colors[type] || 'text-foreground';
}

export function getTypeBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    string: 'bg-green-500/10 text-green-400 border-green-500/20',
    number: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    boolean: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    null: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    object: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    array: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  return colors[type] || '';
}
