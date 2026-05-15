'use client';

import { useRef, useState, useCallback } from 'react';
import { EditorWorkspace } from '@/components/Editor/EditorWorkspace';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [draggingOver, setDraggingOver] = useState(false);
  const workspaceRef = useRef<{ loadFile?: (content: string) => void }>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.items?.[0]?.kind === 'file') setDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDraggingOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      // EditorWorkspace ichidagi handleFileLoad ni trigger qilish uchun
      // custom event ishlatamiz
      window.dispatchEvent(new CustomEvent('json-file-drop', { detail: content }));
    };
    reader.readAsText(file);
  }, []);

  return (
    <div
      className={cn('h-full relative', draggingOver && 'ring-2 ring-inset ring-primary')}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <EditorWorkspace />

      {/* Drop overlay */}
      {draggingOver && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
          <div className="border-2 border-dashed border-primary rounded-xl px-12 py-8 text-center">
            <p className="text-lg font-semibold text-primary">Drop JSON file</p>
            <p className="text-sm text-muted-foreground mt-1">.json or any text file</p>
          </div>
        </div>
      )}
    </div>
  );
}
