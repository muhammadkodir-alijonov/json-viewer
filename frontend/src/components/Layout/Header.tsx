'use client';

import { Braces } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="h-11 border-b border-border bg-background flex items-center px-4 gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-primary text-primary-foreground">
          <Braces className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-sm">JSONViewer</span>
      </div>

      <div className="flex-1" />

      <ThemeToggle />
    </header>
  );
}
