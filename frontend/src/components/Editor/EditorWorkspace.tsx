'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { JsonTree } from './JsonTree';
import { EditorToolbar } from './EditorToolbar';
import { RoomHeader } from '@/components/Room/RoomHeader';
import { useRoom } from '@/hooks/useRoom';
import { useSocket } from '@/hooks/useSocket';
import { useJsonValidation } from '@/hooks/useJsonValidation';
import { PanelLayout } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Monaco is client-only
const JsonEditor = dynamic(
  () => import('./JsonEditor').then((m) => m.JsonEditor),
  { ssr: false }
);

const DEFAULT_JSON = `{
  "name": "JSON Viewer",
  "version": "1.0.0",
  "description": "Real-time collaborative JSON editor",
  "features": [
    "Syntax highlighting",
    "Real-time collaboration",
    "Tree view",
    "Format & Minify"
  ],
  "author": {
    "name": "You",
    "ready": true
  }
}`;

interface EditorWorkspaceProps {
  roomId: string;
}

export function EditorWorkspace({ roomId }: EditorWorkspaceProps) {
  const [value, setValue] = useState(DEFAULT_JSON);
  const [layout, setLayout] = useState<PanelLayout>('split');
  const [isFormatting, setIsFormatting] = useState(false);

  const { status } = useSocket();
  const { synced, clients, user, getYText } = useRoom(roomId);
  const { validation, validate, format, minify } = useJsonValidation();

  // Validate on change
  useEffect(() => {
    validate(value);
  }, [value, validate]);

  // Sync yText initial value
  useEffect(() => {
    const yText = getYText();
    if (!yText || yText.length > 0) return;
    // Only set default if yText is empty (new room)
  }, [getYText]);

  const handleFormat = useCallback(
    async (sortKeys = false) => {
      if (!value.trim()) return;
      setIsFormatting(true);
      const result = await format(value, sortKeys);
      if (result) {
        setValue(result);
        const yText = getYText();
        if (yText) {
          yText.doc?.transact(() => {
            yText.delete(0, yText.length);
            yText.insert(0, result);
          });
        }
        toast.success(sortKeys ? 'Formatted & sorted!' : 'Formatted!');
      } else {
        toast.error('Invalid JSON — cannot format');
      }
      setIsFormatting(false);
    },
    [value, format, getYText]
  );

  const handleMinify = useCallback(async () => {
    if (!value.trim()) return;
    const result = await minify(value);
    if (result) {
      setValue(result);
      const yText = getYText();
      if (yText) {
        yText.doc?.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, result);
        });
      }
      toast.success('Minified!');
    } else {
      toast.error('Invalid JSON — cannot minify');
    }
  }, [value, minify, getYText]);

  const showEditor = layout === 'split' || layout === 'editor-only';
  const showTree = layout === 'split' || layout === 'tree-only';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <RoomHeader
        roomId={roomId}
        clients={clients}
        currentUser={user}
        connectionStatus={status}
        synced={synced}
      />

      <EditorToolbar
        value={value}
        validation={validation}
        layout={layout}
        isFormatting={isFormatting}
        onFormat={handleFormat}
        onMinify={handleMinify}
        onLayoutChange={setLayout}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        {showEditor && (
          <div
            className={cn(
              'flex flex-col overflow-hidden',
              layout === 'split' ? 'w-1/2 border-r border-border' : 'w-full'
            )}
          >
            <div className="h-7 px-3 flex items-center border-b border-border bg-muted/30 shrink-0">
              <span className="text-xs text-muted-foreground font-medium">Editor</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <JsonEditor
                value={value}
                onChange={setValue}
                yText={getYText()}
                onFormat={() => handleFormat(false)}
              />
            </div>
          </div>
        )}

        {/* Tree panel */}
        {showTree && (
          <div
            className={cn(
              'flex flex-col overflow-hidden',
              layout === 'split' ? 'w-1/2' : 'w-full'
            )}
          >
            <div className="h-7 px-3 flex items-center border-b border-border bg-muted/30 shrink-0">
              <span className="text-xs text-muted-foreground font-medium">Tree View</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <JsonTree value={value} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
