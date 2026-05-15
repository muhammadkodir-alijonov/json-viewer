'use client';

import { useCallback, useRef, useEffect } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { editor, KeyMod, KeyCode } from 'monaco-editor';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFormat?: () => void;
  onCursorChange?: (line: number, col: number) => void;
  fontSize?: number;
}

export function JsonEditor({ value, onChange, onFormat, onCursorChange, fontSize = 13 }: JsonEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  // Ref pattern: stale closure muammosini hal qiladi
  const onFormatRef = useRef(onFormat);
  const onCursorChangeRef = useRef(onCursorChange);
  useEffect(() => { onFormatRef.current = onFormat; }, [onFormat]);
  useEffect(() => { onCursorChangeRef.current = onCursorChange; }, [onCursorChange]);

  const beforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('json-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string.key.json',   foreground: '79b8ff' },
        { token: 'string.value.json', foreground: '85e89d' },
        { token: 'number.json',       foreground: 'f8c555' },
        { token: 'keyword.json',      foreground: 'f97583' },
        { token: 'delimiter.bracket.json', foreground: 'abb2bf' },
        { token: 'delimiter.comma.json',   foreground: 'abb2bf' },
        { token: 'delimiter.colon.json',   foreground: 'abb2bf' },
      ],
      colors: {
        'editor.background':                '#0d1117',
        'editor.foreground':                '#e6edf3',
        'editor.lineHighlightBackground':   '#161b2280',
        'editor.lineHighlightBorder':       '#00000000',
        'editorLineNumber.foreground':      '#6e7681',
        'editorLineNumber.activeForeground':'#e6edf3',
        'editor.selectionBackground':       '#264f7866',
        'editorCursor.foreground':          '#79b8ff',
        'editorIndentGuide.background1':    '#21262d',
        'editorIndentGuide.activeBackground1': '#30363d',
        'editorBracketMatch.background':    '#0d419d55',
        'editorBracketMatch.border':        '#388bfd',
        'scrollbar.shadow':                 '#00000000',
        'scrollbarSlider.background':       '#484f5833',
        'scrollbarSlider.hoverBackground':  '#484f5855',
        'scrollbarSlider.activeBackground': '#484f5877',
      },
    });

    monaco.editor.defineTheme('json-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'string.key.json',   foreground: '0550ae' },
        { token: 'string.value.json', foreground: '116329' },
        { token: 'number.json',       foreground: '0550ae' },
        { token: 'keyword.json',      foreground: 'cf222e' },
      ],
      colors: {
        'editor.background':                '#ffffff',
        'editor.foreground':                '#24292f',
        'editor.lineHighlightBackground':   '#f6f8fa',
        'editor.lineHighlightBorder':       '#00000000',
        'editorLineNumber.foreground':      '#8c959f',
        'editorLineNumber.activeForeground':'#24292f',
        'editor.selectionBackground':       '#add6ff',
        'editorCursor.foreground':          '#0969da',
        'editorBracketMatch.background':    '#ddf4ff',
        'editorBracketMatch.border':        '#0969da',
      },
    });

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
    });
  };

  // useCallback dependency yo'q — ref orqali har doim yangi qiymat oladi
  const onMount: OnMount = useCallback((ed) => {
    editorRef.current = ed;

    // Ctrl/Cmd + Shift + F → format (har doim fresh onFormat chaqiriladi)
    ed.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyF, () => {
      onFormatRef.current?.();
    });

    // Cursor position tracking
    ed.onDidChangeCursorPosition((e) => {
      onCursorChangeRef.current?.(e.position.lineNumber, e.position.column);
    });

    ed.focus();
  }, []); // bo'sh dependency — faqat bir marta mount qilinadi

  const theme = resolvedTheme === 'dark' ? 'json-dark' : 'json-light';

  return (
    <Editor
      height="100%"
      language="json"
      theme={theme}
      value={value}
      beforeMount={beforeMount}
      onMount={onMount}
      onChange={(v) => onChange(v ?? '')}
      loading={
        <div className="flex items-center justify-center h-full gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading editor...
        </div>
      }
      options={{
        fontSize,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
        fontLigatures: true,
        lineNumbers: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'off',
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        formatOnPaste: true,
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        renderWhitespace: 'none',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        padding: { top: 12, bottom: 12 },
        quickSuggestions: false,
        folding: true,
        showFoldingControls: 'mouseover',
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
          verticalScrollbarSize: 5,
          horizontalScrollbarSize: 5,
        },
        overviewRulerBorder: false,
        renderLineHighlight: 'line',
      }}
    />
  );
}
