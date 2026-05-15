'use client';

import Link from 'next/link';
import { Braces } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Separator } from '@/components/ui/separator';

export function Header() {
  return (
    <header className="h-12 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground">
          <Braces className="w-4 h-4" />
        </div>
        <span className="font-semibold text-sm tracking-tight">JSONViewer</span>
      </Link>

      <Separator orientation="vertical" className="h-4 mx-1" />

      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
          Viewer
        </span>
        <span className="px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
          Docs
        </span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
