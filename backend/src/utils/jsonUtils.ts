import { JsonValidationResult, JsonFormatOptions } from '../types/index.js';

/**
 * JSON ni validate qilish - batafsil xato ma'lumotlari bilan
 */
export function validateJson(input: string): JsonValidationResult {
  if (!input || input.trim() === '') {
    return {
      valid: false,
      error: { message: 'Input is empty' },
    };
  }

  const MAX_SIZE_MB = parseInt(process.env.MAX_JSON_SIZE_MB || '10');
  const sizeInMB = Buffer.byteLength(input, 'utf8') / (1024 * 1024);

  if (sizeInMB > MAX_SIZE_MB) {
    return {
      valid: false,
      error: { message: `JSON size (${sizeInMB.toFixed(2)}MB) exceeds limit of ${MAX_SIZE_MB}MB` },
    };
  }

  try {
    const parsed = JSON.parse(input);
    const stats = analyzeJson(parsed);

    return {
      valid: true,
      size: Buffer.byteLength(input, 'utf8'),
      depth: stats.depth,
      keyCount: stats.keyCount,
    };
  } catch (e) {
    const error = e as SyntaxError;
    const errorInfo = parseJsonError(error.message, input);

    return {
      valid: false,
      error: errorInfo,
    };
  }
}

/**
 * JSON syntax error dan line/column ma'lumot olish
 */
function parseJsonError(
  message: string,
  input: string
): { message: string; line?: number; column?: number; position?: number } {
  // "position 123" yoki "at position 123" formatini parse qilish
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const position = parseInt(positionMatch[1]);
    const lineInfo = getLineColumn(input, position);
    return {
      message: cleanErrorMessage(message),
      ...lineInfo,
      position,
    };
  }

  // "line X column Y" formatini parse qilish
  const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    return {
      message: cleanErrorMessage(message),
      line: parseInt(lineColMatch[1]),
      column: parseInt(lineColMatch[2]),
    };
  }

  return { message: cleanErrorMessage(message) };
}

function cleanErrorMessage(message: string): string {
  return message
    .replace(/^SyntaxError:\s*/i, '')
    .replace(/JSON\.parse:\s*/i, '')
    .trim();
}

function getLineColumn(input: string, position: number): { line: number; column: number } {
  const lines = input.substring(0, position).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

/**
 * JSON statistikasini hisoblash
 */
function analyzeJson(
  value: unknown,
  depth = 0
): { depth: number; keyCount: number } {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      let maxDepth = depth;
      let totalKeys = 0;
      for (const item of value) {
        const stats = analyzeJson(item, depth + 1);
        maxDepth = Math.max(maxDepth, stats.depth);
        totalKeys += stats.keyCount;
      }
      return { depth: maxDepth, keyCount: totalKeys };
    } else {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      let maxDepth = depth;
      let totalKeys = keys.length;
      for (const key of keys) {
        const stats = analyzeJson(obj[key], depth + 1);
        maxDepth = Math.max(maxDepth, stats.depth);
        totalKeys += stats.keyCount;
      }
      return { depth: maxDepth, keyCount: totalKeys };
    }
  }
  return { depth, keyCount: 0 };
}

/**
 * JSON ni format qilish (pretty print)
 */
export function formatJson(
  input: string,
  options: JsonFormatOptions = {}
): { success: boolean; result?: string; error?: string } {
  const validation = validateJson(input);

  if (!validation.valid) {
    return { success: false, error: validation.error?.message };
  }

  try {
    let parsed = JSON.parse(input);

    if (options.sortKeys) {
      parsed = sortObjectKeys(parsed);
    }

    const indent = options.indent ?? 2;
    return {
      success: true,
      result: JSON.stringify(parsed, null, indent),
    };
  } catch (e) {
    return { success: false, error: 'Failed to format JSON' };
  }
}

/**
 * JSON ni minify qilish
 */
export function minifyJson(
  input: string
): { success: boolean; result?: string; error?: string } {
  const validation = validateJson(input);

  if (!validation.valid) {
    return { success: false, error: validation.error?.message };
  }

  try {
    const parsed = JSON.parse(input);
    return {
      success: true,
      result: JSON.stringify(parsed),
    };
  } catch (e) {
    return { success: false, error: 'Failed to minify JSON' };
  }
}

/**
 * Object keylarini sort qilish (recursive)
 */
function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (typeof obj === 'object' && obj !== null) {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    for (const key of keys) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

/**
 * JSON type ni aniqlash
 */
export function getJsonType(
  input: string
): 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'invalid' {
  try {
    const parsed = JSON.parse(input);
    if (parsed === null) return 'null';
    if (Array.isArray(parsed)) return 'array';
    return typeof parsed as 'object' | 'string' | 'number' | 'boolean';
  } catch {
    return 'invalid';
  }
}
