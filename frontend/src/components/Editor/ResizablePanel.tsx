'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizablePanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number; // 0–100 percent
  minSplit?: number;
  maxSplit?: number;
}

export function ResizablePanel({
  left,
  right,
  defaultSplit = 50,
  minSplit = 20,
  maxSplit = 80,
}: ResizablePanelProps) {
  const [split, setSplit] = useState(defaultSplit);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(maxSplit, Math.max(minSplit, pct)));
    };

    const onMouseUp = () => setDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, minSplit, maxSplit]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden"
      style={{ cursor: dragging ? 'col-resize' : 'default' }}
    >
      {/* Left panel */}
      <div className="flex flex-col overflow-hidden" style={{ width: `${split}%` }}>
        {left}
      </div>

      {/* Drag handle */}
      <div
        className={cn(
          'relative flex items-center justify-center w-1 shrink-0 cursor-col-resize group',
          'hover:bg-primary/40 transition-colors duration-150',
          dragging && 'bg-primary/60'
        )}
        onMouseDown={onMouseDown}
      >
        <div
          className={cn(
            'w-0.5 h-8 rounded-full bg-border transition-all duration-150',
            'group-hover:bg-primary/80 group-hover:h-12',
            dragging && 'bg-primary h-16'
          )}
        />
      </div>

      {/* Right panel */}
      <div className="flex flex-col overflow-hidden flex-1">
        {right}
      </div>
    </div>
  );
}
