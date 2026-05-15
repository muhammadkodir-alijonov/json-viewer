'use client';

import { useState, useCallback, useRef } from 'react';
import { JsonValidationResult } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Debounce helper
function useDebounceCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

export function useJsonValidation() {
  const [validation, setValidation] = useState<JsonValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async (json: string) => {
    if (!json.trim()) {
      setValidation(null);
      return;
    }

    // Client-side quick check first
    try {
      JSON.parse(json);
      setValidation({ valid: true, size: new TextEncoder().encode(json).length });
    } catch (e) {
      const err = e as SyntaxError;
      setValidation({ valid: false, error: { message: err.message } });
    }
  }, []);

  const validateDebounced = useDebounceCallback(validate, 300);

  const format = useCallback(async (json: string, sortKeys = false): Promise<string | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/json/format`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json, sortKeys }),
      });
      const data = await res.json();
      return data.success ? data.data.formatted : null;
    } catch {
      return null;
    }
  }, []);

  const minify = useCallback(async (json: string): Promise<string | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/json/minify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json }),
      });
      const data = await res.json();
      return data.success ? data.data.minified : null;
    } catch {
      return null;
    }
  }, []);

  return {
    validation,
    isValidating,
    validate: validateDebounced,
    format,
    minify,
  };
}
