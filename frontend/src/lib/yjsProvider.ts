'use client';

import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import { Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '@/types';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class YjsSocketIOProvider {
  public doc: Y.Doc;
  public awareness: awarenessProtocol.Awareness;
  private socket: AppSocket;
  private roomId: string;
  private _synced: boolean = false;

  constructor(socket: AppSocket, roomId: string, doc: Y.Doc) {
    this.socket = socket;
    this.roomId = roomId;
    this.doc = doc;
    this.awareness = new awarenessProtocol.Awareness(doc);

    this.setupListeners();
  }

  get synced(): boolean {
    return this._synced;
  }

  private setupListeners(): void {
    // Server dan initial state kelganda
    this.socket.on('sync:state', (state: Uint8Array) => {
      Y.applyUpdate(this.doc, state);
      this._synced = true;
    });

    // Server dan update kelganda
    this.socket.on('sync:update', (update: Uint8Array) => {
      Y.applyUpdate(this.doc, update);
    });

    // Awareness update
    this.socket.on('awareness:update', (update: Uint8Array) => {
      awarenessProtocol.applyAwarenessUpdate(this.awareness, update, this);
    });

    // Local doc o'zgarganda server ga yuborish
    this.doc.on('update', (update: Uint8Array) => {
      this.socket.emit('sync:update', update);
    });

    // Local awareness o'zgarganda
    this.awareness.on('update', ({ added, updated, removed }: {
      added: number[];
      updated: number[];
      removed: number[];
    }) => {
      const changedClients = added.concat(updated, removed);
      const update = awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients);
      this.socket.emit('awareness:update', update);
    });

    // Initial state so'rash
    this.socket.emit('sync:request-state');
  }

  setLocalUser(user: { name: string; color: string }): void {
    this.awareness.setLocalStateField('user', user);
  }

  destroy(): void {
    this.socket.off('sync:state');
    this.socket.off('sync:update');
    this.socket.off('awareness:update');
    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      [this.doc.clientID],
      this
    );
    this.awareness.destroy();
  }
}
