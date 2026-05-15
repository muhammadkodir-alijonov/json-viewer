'use client';

import { Braces } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="h-11 border-b border-border bg-background flex items-center px-4 gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-md" style={{ background: '#FFB800' }}>
          <Braces className="w-4 h-4 text-black" />
        </div>
        <span className="font-bold text-sm tracking-tight">
          <span style={{ color: '#FFB800' }}>FB</span>
          <span className="text-foreground"> JSONViewer</span>
        </span>
      </div>

      <div className="flex-1" />

      <span className="text-[11px] text-muted-foreground/50 select-none hidden sm:block">
        by <span className="text-muted-foreground/70 font-medium">muhammadqodir</span>
      </span>

      <ThemeToggle />
    </header>
  );
}
