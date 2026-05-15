'use client';

import { CheckCircle2, XCircle, FileJson } from 'lucide-react';
import { JsonValidationResult } from '@/types';
import { formatBytes } from '@/lib/jsonUtils';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  validation: JsonValidationResult | null;
  cursorLine?: number;
  cursorCol?: number;
}

export function StatusBar({ validation, cursorLine, cursorCol }: StatusBarProps) {
  const isValid = validation?.valid;

  return (
    <div className="h-6 border-t border-border bg-muted/30 flex items-center px-3 gap-4 shrink-0 text-[11px] text-muted-foreground select-none">
      {/* Validation status */}
      {validation ? (
        <div className={cn('flex items-center gap-1.5 font-medium', isValid ? 'text-green-500' : 'text-destructive')}>
          {isValid ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {isValid ? 'Valid JSON' : validation.error?.message}
          {!isValid && validation.error?.line && (
            <span className="text-muted-foreground font-normal">
              — Line {validation.error.line}, Col {validation.error.column}
            </span>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground/50">—</span>
      )}

      <div className="flex-1" />

      {/* Stats */}
      {isValid && validation && (
        <>
          {validation.type && (
            <div className="flex items-center gap-1">
              <FileJson className="w-3 h-3" />
              <span>{validation.type}</span>
            </div>
          )}
          {validation.size != null && (
            <span>{formatBytes(validation.size)}</span>
          )}
          {validation.lineCount != null && (
            <span>{validation.lineCount} lines</span>
          )}
          {validation.depth != null && (
            <span>depth {validation.depth}</span>
          )}
        </>
      )}

      {/* Cursor */}
      {cursorLine != null && (
        <span>Ln {cursorLine}, Col {cursorCol}</span>
      )}

    </div>
  );
}
