'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { JsonTree } from './JsonTree';
import { EditorToolbar } from './EditorToolbar';
import { StatusBar } from './StatusBar';
import { ResizablePanel } from './ResizablePanel';
import { useJsonEditor } from '@/hooks/useJsonEditor';

const JsonEditor = dynamic(() => import('./JsonEditor').then((m) => m.JsonEditor), { ssr: false });

export function EditorWorkspace() {
  const {
    value, validation, layout,
    setLayout, handleChange, handleFormat, handleMinify,
    handleClear, handleFileLoad,
  } = useJsonEditor();

  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  const handleCursor = useCallback((line: number, col: number) => {
    setCursor({ line, col });
  }, []);

  const showEditor = layout !== 'tree-only';
  const showTree   = layout !== 'editor-only';

  const editorPanel = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-7 px-3 flex items-center bg-muted/20 border-b border-border shrink-0">
        <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Editor</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <JsonEditor
          value={value}
          onChange={handleChange}
          onFormat={() => { handleFormat(false); }}
          onCursorChange={handleCursor}
        />
      </div>
    </div>
  );

  const treePanel = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-7 px-3 flex items-center bg-muted/20 border-b border-border shrink-0">
        <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Tree View</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <JsonTree value={value} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <EditorToolbar
        value={value}
        layout={layout}
        onFormat={handleFormat}
        onMinify={handleMinify}
        onClear={handleClear}
        onFileLoad={handleFileLoad}
        onLayoutChange={setLayout}
      />

      <div className="flex-1 overflow-hidden">
        {layout === 'split' ? (
          <ResizablePanel left={editorPanel} right={treePanel} />
        ) : layout === 'editor-only' ? (
          <div className="h-full">{editorPanel}</div>
        ) : (
          <div className="h-full">{treePanel}</div>
        )}
      </div>

      <StatusBar
        validation={validation}
        cursorLine={cursor.line}
        cursorCol={cursor.col}
      />
    </div>
  );
}
