'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableTaskColumnProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DroppableTaskColumn({ id, children, className }: DroppableTaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      status: id
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && "ring-2 ring-neon-green/50"
      )}
    >
      {children}
    </div>
  );
}