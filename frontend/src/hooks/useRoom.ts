'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { useSocket } from './useSocket';
import { YjsSocketIOProvider } from '@/lib/yjsProvider';
import { ClientInfo } from '@/types';

const ADJECTIVES = ['Swift', 'Bright', 'Cool', 'Bold', 'Sharp'];
const ANIMALS = ['Fox', 'Owl', 'Cat', 'Bear', 'Wolf'];
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

function generateUser() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 100);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { name: `${adj}${animal}${num}`, color };
}

export function useRoom(roomId: string) {
  const { socket, status, joinRoom, leaveRoom } = useSocket();

  const [synced, setSynced] = useState(false);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<YjsSocketIOProvider | null>(null);
  const userRef = useRef(generateUser());

  // Doc va provider initialize
  useEffect(() => {
    if (!roomId) return;

    docRef.current = new Y.Doc();

    return () => {
      providerRef.current?.destroy();
      docRef.current?.destroy();
      docRef.current = null;
      providerRef.current = null;
    };
  }, [roomId]);

  // Socket connected bo'lganda roomga kirish
  useEffect(() => {
    if (status !== 'connected' || !roomId || !docRef.current) return;

    joinRoom(roomId)
      .then(() => {
        if (!docRef.current) return;

        providerRef.current = new YjsSocketIOProvider(socket, roomId, docRef.current);
        providerRef.current.setLocalUser(userRef.current);

        // Sync holati
        setTimeout(() => setSynced(true), 500);
      })
      .catch((err: Error) => {
        setError(err.message);
      });

    // Room events
    socket.on('room:joined', ({ clients: clientIds }) => {
      setClients(clientIds.map((id) => ({ id, name: id.slice(0, 8), color: COLORS[0] })));
    });

    socket.on('room:left', ({ clientId }) => {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    });

    socket.on('room:error', ({ message }) => {
      setError(message);
    });

    return () => {
      leaveRoom();
      socket.off('room:joined');
      socket.off('room:left');
      socket.off('room:error');
      providerRef.current?.destroy();
      providerRef.current = null;
      setSynced(false);
    };
  }, [status, roomId, socket, joinRoom, leaveRoom]);

  const getYText = useCallback(() => {
    return docRef.current?.getText('json') ?? null;
  }, []);

  const getDoc = useCallback(() => docRef.current, []);

  return {
    synced,
    clients,
    error,
    user: userRef.current,
    getYText,
    getDoc,
  };
}
