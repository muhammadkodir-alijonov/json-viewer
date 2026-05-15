import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TreeNode } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  key = 'root',
  path = '',
  depth = 0
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

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    string:  'text-green-400',
    number:  'text-blue-400',
    boolean: 'text-yellow-400',
    null:    'text-gray-400',
    object:  'text-purple-400',
    array:   'text-orange-400',
  };
  return colors[type] || 'text-foreground';
}
