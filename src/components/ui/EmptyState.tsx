'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export function EmptyState({
  icon = <Inbox className="w-10 h-10 text-zinc-500" />,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl my-4">
      <div className="p-3 bg-zinc-800/40 rounded-full mb-4 text-zinc-400">{icon}</div>
      <h3 className="text-base font-semibold text-zinc-200">{title}</h3>
      {description && <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} leftIcon={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
