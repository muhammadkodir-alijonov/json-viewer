import { JsonValidationResult, JsonValueType } from '@/types';

export function validateJson(input: string): JsonValidationResult {
  if (!input.trim()) return { valid: false, error: { message: 'Empty input' } };

  try {
    const parsed = JSON.parse(input);
    const size = new TextEncoder().encode(input).length;
    const { depth, keyCount } = analyzeJson(parsed);
    const lineCount = input.split('\n').length;
    return { valid: true, size, depth, keyCount, lineCount, type: getType(parsed) };
  } catch (e) {
    const msg = (e as SyntaxError).message;
    return { valid: false, error: parseError(msg, input) };
  }
}

function parseError(message: string, input: string) {
  const posMatch = message.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1]);
    const before = input.substring(0, pos);
    const lines = before.split('\n');
    return {
      message: message.replace(/^SyntaxError:\s*/i, '').replace(/JSON\.parse:\s*/i, '').trim(),
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
      position: pos,
    };
  }
  return { message: message.replace(/^SyntaxError:\s*/i, '').trim() };
}

function getType(value: unknown): JsonValueType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonValueType;
}

function analyzeJson(value: unknown, depth = 0): { depth: number; keyCount: number } {
  if (value === null || typeof value !== 'object') return { depth, keyCount: 0 };
  if (Array.isArray(value)) {
    let max = depth, keys = 0;
    for (const item of value) {
      const s = analyzeJson(item, depth + 1);
      max = Math.max(max, s.depth);
      keys += s.keyCount;
    }
    return { depth: max, keyCount: keys };
  }
  const obj = value as Record<string, unknown>;
  const entries = Object.entries(obj);
  let max = depth, keys = entries.length;
  for (const [, v] of entries) {
    const s = analyzeJson(v, depth + 1);
    max = Math.max(max, s.depth);
    keys += s.keyCount;
  }
  return { depth: max, keyCount: keys };
}

export function formatJson(input: string, indent = 2, sortKeys = false): string | null {
  try {
    let parsed = JSON.parse(input);
    if (sortKeys) parsed = sortObjectKeys(parsed);
    return JSON.stringify(parsed, null, indent);
  } catch {
    return null;
  }
}

export function minifyJson(input: string): string | null {
  try {
    return JSON.stringify(JSON.parse(input));
  } catch {
    return null;
  }
}

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.keys(obj as object)
        .sort()
        .map((k) => [k, sortObjectKeys((obj as Record<string, unknown>)[k])])
    );
  }
  return obj;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
