import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/Layout/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'FB JSONViewer — Format, Validate & Explore JSON',
  description: 'Fido Biznes JSON viewer with syntax highlighting, tree view, format and minify.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen flex flex-col overflow-hidden antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          <TooltipProvider delayDuration={500}>
            <Header />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast: 'bg-background border border-border text-foreground text-sm shadow-lg',
                  success: '!text-green-500',
                  error:   '!text-destructive',
                },
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
