'use client';

import { useState } from 'react';
import {
  AlignLeft, Minimize2, Copy, Download, CheckCircle2,
  XCircle, AlertCircle, Columns2, PanelLeft, PanelRight,
  SortAsc, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { JsonValidationResult, PanelLayout } from '@/types';
import { formatBytes, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EditorToolbarProps {
  value: string;
  validation: JsonValidationResult | null;
  layout: PanelLayout;
  isFormatting?: boolean;
  onFormat: (sortKeys?: boolean) => void;
  onMinify: () => void;
  onLayoutChange: (layout: PanelLayout) => void;
}

export function EditorToolbar({
  value,
  validation,
  layout,
  isFormatting,
  onFormat,
  onMinify,
  onLayoutChange,
}: EditorToolbarProps) {
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopying(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopying(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const ValidationBadge = () => {
    if (!validation) return null;
    if (validation.valid) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-green-500">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Valid JSON</span>
          {validation.size != null && (
            <span className="text-muted-foreground">· {formatBytes(validation.size)}</span>
          )}
          {validation.depth != null && (
            <span className="text-muted-foreground">· depth {validation.depth}</span>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-xs text-destructive">
        <XCircle className="w-3.5 h-3.5" />
        <span className="truncate max-w-[200px]">{validation.error?.message}</span>
        {validation.error?.line && (
          <span className="text-muted-foreground shrink-0">
            line {validation.error.line}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="h-9 border-b border-border bg-background flex items-center px-2 gap-1 shrink-0">
      {/* Format actions */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFormat(false)}
            disabled={isFormatting}
            className="h-7 px-2 text-xs gap-1.5"
          >
            {isFormatting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AlignLeft className="w-3.5 h-3.5" />
            )}
            Format
          </Button>
        </TooltipTrigger>
        <TooltipContent>Pretty print (Ctrl+Shift+F)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFormat(true)}
            disabled={isFormatting}
            className="h-7 px-2 text-xs gap-1.5"
          >
            <SortAsc className="w-3.5 h-3.5" />
            Sort Keys
          </Button>
        </TooltipTrigger>
        <TooltipContent>Format and sort keys alphabetically</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinify}
            className="h-7 px-2 text-xs gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Minify
          </Button>
        </TooltipTrigger>
        <TooltipContent>Minify JSON</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-4 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
            <Copy className={cn('w-3.5 h-3.5', copying && 'text-green-500')} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy JSON</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download as .json</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-4 mx-1" />

      {/* Validation status */}
      <div className="flex-1 flex items-center">
        <ValidationBadge />
      </div>

      {/* Layout toggle */}
      <div className="flex items-center gap-0.5 ml-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={layout === 'editor-only' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => onLayoutChange('editor-only')}
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editor only</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={layout === 'split' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => onLayoutChange('split')}
            >
              <Columns2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split view</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={layout === 'tree-only' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => onLayoutChange('tree-only')}
            >
              <PanelRight className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tree view only</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
