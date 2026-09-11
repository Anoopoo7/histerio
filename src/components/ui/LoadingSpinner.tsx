'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-zinc-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
      {label && <p className="text-xs font-medium text-zinc-400">{label}</p>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/60 rounded-md ${className}`} />;
}
