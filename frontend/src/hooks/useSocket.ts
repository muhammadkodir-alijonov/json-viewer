'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const socket = connectSocket();

    const set = (s: ConnectionStatus) => {
      if (mountedRef.current) setStatus(s);
    };

    set('connecting');

    socket.on('connect', () => set('connected'));
    socket.on('disconnect', () => set('disconnected'));
    socket.on('connect_error', () => set('error'));
    socket.on('reconnecting', () => set('connecting'));

    if (socket.connected) set('connected');

    return () => {
      mountedRef.current = false;
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('reconnecting');
    };
  }, []);

  const createRoom = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      if (!socket.connected) {
        reject(new Error('Not connected'));
        return;
      }
      socket.emit('room:create', (roomId: string) => {
        resolve(roomId);
      });
    });
  }, []);

  const joinRoom = useCallback((roomId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      if (!socket.connected) {
        reject(new Error('Not connected'));
        return;
      }
      socket.emit('room:join', roomId, (success: boolean, error?: string) => {
        if (success) resolve();
        else reject(new Error(error || 'Failed to join room'));
      });
    });
  }, []);

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('room:leave');
    }
  }, []);

  return {
    socket: getSocket(),
    status,
    isConnected: status === 'connected',
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
