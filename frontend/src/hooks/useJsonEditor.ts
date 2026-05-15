'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { validateJson, formatJson, minifyJson } from '@/lib/jsonUtils';
import { JsonValidationResult, PanelLayout } from '@/types';

const DEFAULT_JSON = `{
  "name": "JSON Viewer",
  "version": "1.0.0",
  "features": [
    "Syntax highlighting",
    "Real-time validation",
    "Tree view",
    "Format & Minify"
  ],
  "author": {
    "name": "You",
    "ready": true
  }
}`;

export function useJsonEditor() {
  const [value, setValue] = useState(DEFAULT_JSON);
  const [validation, setValidation] = useState<JsonValidationResult | null>(null);
  const [layout, setLayout] = useState<PanelLayout>('split');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced validation
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setValidation(validateJson(value));
    }, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  // Initial validation
  useEffect(() => { setValidation(validateJson(DEFAULT_JSON)); }, []);

  // Drag & drop file event listener
  useEffect(() => {
    const handler = (e: Event) => {
      const content = (e as CustomEvent<string>).detail;
      if (content) setValue(content);
    };
    window.addEventListener('json-file-drop', handler);
    return () => window.removeEventListener('json-file-drop', handler);
  }, []);

  const handleChange = useCallback((v: string) => setValue(v), []);

  const handleFormat = useCallback((sortKeys = false) => {
    const result = formatJson(value, 2, sortKeys);
    if (result) setValue(result);
    return !!result;
  }, [value]);

  const handleMinify = useCallback(() => {
    const result = minifyJson(value);
    if (result) setValue(result);
    return !!result;
  }, [value]);

  const handleClear = useCallback(() => setValue(''), []);

  const handleFileLoad = useCallback((content: string) => setValue(content), []);

  return {
    value,
    validation,
    layout,
    setLayout,
    handleChange,
    handleFormat,
    handleMinify,
    handleClear,
    handleFileLoad,
  };
}
