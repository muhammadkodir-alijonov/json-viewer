'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Braces, Users, Zap, Shield, ArrowRight, Loader2, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const { createRoom, isConnected, status } = useSocket();
  const [creating, setCreating] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [joining, setJoining] = useState(false);

  const handleCreate = async () => {
    if (!isConnected) {
      toast.error('Connecting to server...');
      return;
    }
    setCreating(true);
    try {
      const roomId = await createRoom();
      router.push(`/room/${roomId}`);
    } catch {
      toast.error('Failed to create room. Is the backend running?');
      setCreating(false);
    }
  };

  const handleJoin = () => {
    const id = roomInput.trim();
    if (!id) return;
    // Extract room ID from URL if pasted
    const match = id.match(/\/room\/([a-z0-9]+)/);
    const roomId = match ? match[1] : id;
    router.push(`/room/${roomId}`);
  };

  const features = [
    { icon: Zap, title: 'Real-time sync', desc: 'Edit together with 100+ users simultaneously' },
    { icon: Braces, title: 'Smart editor', desc: 'VS Code-powered Monaco with JSON validation' },
    { icon: Users, title: 'Collaboration', desc: 'See who is online with live cursors' },
    { icon: Shield, title: 'Always valid', desc: 'Instant error highlighting and line numbers' },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 gap-12">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-lg">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
          <Braces className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          JSON Viewer
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Format, validate, and collaborate on JSON in real-time.
          Share a link — anyone can join instantly.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <Button
          size="lg"
          className="w-full gap-2 h-11"
          onClick={handleCreate}
          disabled={creating || status === 'connecting'}
        >
          {creating || status === 'connecting' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Braces className="w-4 h-4" />
          )}
          {creating ? 'Creating room...' : 'New JSON Session'}
          {!creating && status !== 'connecting' && <ArrowRight className="w-4 h-4 ml-auto" />}
        </Button>

        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or join existing</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="Room ID or share link..."
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleJoin}
            disabled={!roomInput.trim() || joining}
            className="gap-1.5"
          >
            <Link className="w-3.5 h-3.5" />
            Join
          </Button>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'connected'
                ? 'bg-green-500'
                : status === 'connecting'
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-red-500'
            }`}
          />
          {status === 'connected'
            ? 'Server connected'
            : status === 'connecting'
            ? 'Connecting to server...'
            : 'Server offline — start backend first'}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <Icon className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
