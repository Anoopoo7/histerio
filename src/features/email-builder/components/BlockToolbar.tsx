'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Copy, Trash2, Layers } from 'lucide-react';

export interface BlockToolbarProps {
  label: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSelectParent?: () => void;
}

export function BlockToolbar({
  label,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onSelectParent,
}: BlockToolbarProps) {
  return (
    <div
      className="absolute -top-9 right-2 z-30 flex items-center gap-1 p-1 bg-indigo-950/90 border border-indigo-500/50 rounded-lg shadow-xl text-xs text-zinc-100 backdrop-blur-xs select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="px-2 font-semibold text-[11px] text-indigo-300 uppercase tracking-wider border-r border-indigo-800/80">
        {label}
      </span>

      {onSelectParent && (
        <button
          type="button"
          onClick={onSelectParent}
          className="p-1 hover:bg-indigo-800/60 rounded transition-colors text-indigo-300 hover:text-white"
          title="Select Parent Container"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      )}

      {onMoveUp && (
        <button
          type="button"
          onClick={onMoveUp}
          className="p-1 hover:bg-indigo-800/60 rounded transition-colors text-zinc-300 hover:text-white"
          title="Move Up"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      )}

      {onMoveDown && (
        <button
          type="button"
          onClick={onMoveDown}
          className="p-1 hover:bg-indigo-800/60 rounded transition-colors text-zinc-300 hover:text-white"
          title="Move Down"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      )}

      {onDuplicate && (
        <button
          type="button"
          onClick={onDuplicate}
          className="p-1 hover:bg-indigo-800/60 rounded transition-colors text-emerald-400 hover:text-emerald-300"
          title="Duplicate"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-1 hover:bg-rose-900/60 rounded transition-colors text-rose-400 hover:text-rose-300"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
