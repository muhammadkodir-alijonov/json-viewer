'use client';

import { ClientInfo } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface UserAvatarsProps {
  clients: ClientInfo[];
  currentUser?: { name: string; color: string };
  max?: number;
}

export function UserAvatars({ clients, currentUser, max = 5 }: UserAvatarsProps) {
  const all = currentUser
    ? [{ id: 'me', ...currentUser }, ...clients.filter((c) => c.id !== 'me')]
    : clients;

  const visible = all.slice(0, max);
  const overflow = all.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((user, i) => (
        <Tooltip key={user.id}>
          <TooltipTrigger asChild>
            <div
              className="relative w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white cursor-default select-none"
              style={{ backgroundColor: user.color, zIndex: visible.length - i }}
            >
              {user.name.slice(0, 1).toUpperCase()}
              {user.id === 'me' && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border border-background" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {user.name} {user.id === 'me' ? '(you)' : ''}
          </TooltipContent>
        </Tooltip>
      ))}

      {overflow > 0 && (
        <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
          +{overflow}
        </div>
      )}
    </div>
  );
}
