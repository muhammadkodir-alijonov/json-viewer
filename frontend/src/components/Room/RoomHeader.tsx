'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Users, Wifi, WifiOff, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserAvatars } from './UserAvatars';
import { ClientInfo } from '@/types';
import { ConnectionStatus } from '@/hooks/useSocket';
import { generateRoomUrl } from '@/lib/utils';
import { toast } from 'sonner';

interface RoomHeaderProps {
  roomId: string;
  clients: ClientInfo[];
  currentUser: { name: string; color: string };
  connectionStatus: ConnectionStatus;
  synced: boolean;
}

export function RoomHeader({
  roomId,
  clients,
  currentUser,
  connectionStatus,
  synced,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    const url = generateRoomUrl(roomId);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!', { duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  const StatusIcon = () => {
    if (connectionStatus === 'connecting') return <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />;
    if (connectionStatus === 'connected' && synced) return <Wifi className="w-3 h-3 text-green-500" />;
    if (connectionStatus === 'connected') return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
    return <WifiOff className="w-3 h-3 text-red-500" />;
  };

  const statusText = () => {
    if (connectionStatus === 'connecting') return 'Connecting...';
    if (connectionStatus === 'connected' && synced) return 'Live';
    if (connectionStatus === 'connected') return 'Syncing...';
    return 'Disconnected';
  };

  return (
    <div className="h-10 border-b border-border bg-background flex items-center px-3 gap-3 shrink-0">
      {/* Room ID */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Room:</span>
        <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-foreground">
          {roomId}
        </code>
      </div>

      {/* Share */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" onClick={copyLink}>
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy share link</TooltipContent>
      </Tooltip>

      {/* Divider */}
      <div className="h-4 w-px bg-border" />

      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <StatusIcon />
        <span className="text-xs text-muted-foreground">{statusText()}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Online users */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{clients.length + 1}</span>
        </div>
        <UserAvatars clients={clients} currentUser={currentUser} />
      </div>
    </div>
  );
}
