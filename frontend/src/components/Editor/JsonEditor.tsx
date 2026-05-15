'use client';

import { useEffect, useRef, useCallback } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import * as Y from 'yjs';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { editor, KeyMod, KeyCode } from 'monaco-editor';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  yText: Y.Text | null;
  onFormat?: () => void;
  fontSize?: number;
  readOnly?: boolean;
}

export function JsonEditor({
  value,
  onChange,
  yText,
  onFormat,
  fontSize = 13,
  readOnly = false,
}: JsonEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isRemoteUpdate = useRef(false);
  const isLocalUpdate = useRef(false);

  // Yjs → Monaco sync
  useEffect(() => {
    if (!yText || !editorRef.current) return;

    const handler = (events: Y.YTextEvent[], tr: Y.Transaction) => {
      if (tr.local) return; // local update, skip
      isRemoteUpdate.current = true;

      const ed = editorRef.current!;
      const model = ed.getModel();
      if (!model) return;

      const fullText = yText.toString();
      const currentText = model.getValue();

      if (fullText !== currentText) {
        const position = ed.getPosition();
        model.setValue(fullText);
        if (position) ed.setPosition(position);
        onChange(fullText);
      }

      isRemoteUpdate.current = false;
    };

    yText.observe(handler);
    return () => yText.unobserve(handler);
  }, [yText, onChange]);

  // Monaco → Yjs sync
  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      if (isRemoteUpdate.current || !newValue === undefined) return;
      const val = newValue ?? '';
      onChange(val);

      if (!yText) return;
      isLocalUpdate.current = true;

      const current = yText.toString();
      if (current !== val) {
        yText.doc?.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, val);
        });
      }

      isLocalUpdate.current = false;
    },
    [yText, onChange]
  );

  const beforeMount: BeforeMount = (monaco) => {
    // Custom dark theme
    monaco.editor.defineTheme('json-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: '79b8ff' },
        { token: 'string.value.json', foreground: '85e89d' },
        { token: 'number.json', foreground: '79b8ff' },
        { token: 'keyword.json', foreground: 'f97583' },
        { token: 'delimiter.bracket.json', foreground: 'e1e4e8' },
        { token: 'delimiter.comma.json', foreground: 'e1e4e8' },
        { token: 'delimiter.colon.json', foreground: 'e1e4e8' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editor.lineHighlightBackground': '#161b22',
        'editorLineNumber.foreground': '#6e7681',
        'editorLineNumber.activeForeground': '#e6edf3',
        'editor.selectionBackground': '#264f78',
        'editorCursor.foreground': '#c9d1d9',
        'editor.inactiveSelectionBackground': '#1f2428',
        'editorIndentGuide.background': '#21262d',
        'editorIndentGuide.activeBackground': '#30363d',
      },
    });

    // Custom light theme
    monaco.editor.defineTheme('json-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: '0550ae' },
        { token: 'string.value.json', foreground: '0a3069' },
        { token: 'number.json', foreground: '0550ae' },
        { token: 'keyword.json', foreground: 'cf222e' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#24292f',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editorLineNumber.foreground': '#8c959f',
        'editor.selectionBackground': '#add6ff',
      },
    });
  };

  const onMount: OnMount = (ed, monaco) => {
    editorRef.current = ed;

    // Format shortcut: Ctrl+Shift+F
    ed.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyF, () => {
      onFormat?.();
    });

    // JSON diagnostics — Monaco built-in
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
    });

    // Focus editor
    ed.focus();
  };

  const theme = resolvedTheme === 'dark' ? 'json-dark' : 'json-light';

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Editor
        height="100%"
        language="json"
        theme={theme}
        value={value}
        beforeMount={beforeMount}
        onMount={onMount}
        onChange={handleEditorChange}
        loading={
          <div className="flex items-center justify-center h-full gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading editor...
          </div>
        }
        options={{
          fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: false,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          renderWhitespace: 'none',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 12, bottom: 12 },
          readOnly,
          quickSuggestions: false,
          hover: { enabled: true },
          folding: true,
          foldingHighlight: true,
          showFoldingControls: 'mouseover',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
}
