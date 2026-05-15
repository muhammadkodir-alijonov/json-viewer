'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { EditorWorkspace } from '@/components/Editor/EditorWorkspace';

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = use(params);

  if (!roomId || !/^[a-z0-9]{4,32}$/.test(roomId)) {
    notFound();
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <EditorWorkspace roomId={roomId} />
    </div>
  );
}
