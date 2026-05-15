'use client';

import { useRef } from 'react';
import {
  AlignLeft, Minimize2, SortAsc, Copy, Download,
  Upload, Trash2, Columns2, PanelLeft, PanelRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PanelLayout } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  value: string;
  layout: PanelLayout;
  onFormat: (sortKeys?: boolean) => boolean;
  onMinify: () => boolean;
  onClear: () => void;
  onFileLoad: (content: string) => void;
  onLayoutChange: (layout: PanelLayout) => void;
}

function ToolBtn({
  icon: Icon,
  label,
  shortcut,
  onClick,
  active,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? 'secondary' : 'ghost'}
          size="icon-sm"
          onClick={onClick}
          className={cn(danger && 'hover:text-destructive hover:bg-destructive/10')}
        >
          <Icon className="w-3.5 h-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function EditorToolbar({
  value,
  layout,
  onFormat,
  onMinify,
  onClear,
  onFileLoad,
  onLayoutChange,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormat = () => {
    const ok = onFormat(false);
    ok ? toast.success('Formatted') : toast.error('Invalid JSON');
  };

  const handleSortFormat = () => {
    const ok = onFormat(true);
    ok ? toast.success('Formatted & sorted') : toast.error('Invalid JSON');
  };

  const handleMinify = () => {
    const ok = onMinify();
    ok ? toast.success('Minified') : toast.error('Invalid JSON');
  };

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success('Copied!');
  };

  const handleDownload = () => {
    if (!value) return;
    const blob = new Blob([value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onFileLoad(ev.target?.result as string);
      toast.success(`Loaded: ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="h-9 border-b border-border bg-background flex items-center px-2 gap-0.5 shrink-0">
      {/* Format group */}
      <ToolBtn icon={AlignLeft}  label="Format"    shortcut="⇧⌘F" onClick={handleFormat} />
      <ToolBtn icon={SortAsc}    label="Sort keys" onClick={handleSortFormat} />
      <ToolBtn icon={Minimize2}  label="Minify"    onClick={handleMinify} />

      <Separator orientation="vertical" className="h-4 mx-1.5" />

      {/* File group */}
      <ToolBtn icon={Copy}     label="Copy"     shortcut="⌘C" onClick={handleCopy} />
      <ToolBtn icon={Download} label="Download" onClick={handleDownload} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Upload .json file</TooltipContent>
      </Tooltip>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json,text/plain"
        className="hidden"
        onChange={handleUpload}
      />
      <ToolBtn icon={Trash2} label="Clear" onClick={onClear} danger />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Layout toggle */}
      <div className="flex items-center border border-border rounded-md overflow-hidden">
        {(
          [
            { id: 'editor-only', Icon: PanelLeft,  tip: 'Editor only' },
            { id: 'split',       Icon: Columns2,   tip: 'Split view'  },
            { id: 'tree-only',   Icon: PanelRight, tip: 'Tree only'   },
          ] as const
        ).map(({ id, Icon, tip }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onLayoutChange(id)}
                className={cn(
                  'px-2 h-7 flex items-center transition-colors',
                  layout === id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{tip}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
