'use client';

import React from 'react';
import { BLOCK_REGISTRY, LAYOUT_REGISTRY } from '../model/registry';
import { BuilderBlockType, DragItem, LayoutType } from '../model/types';
import {
  Columns,
  Square,
  Type,
  Heading,
  Image as ImageIcon,
  MousePointerClick,
  Minus,
  MoveVertical,
  Share2,
  Bookmark,
  FileText,
  GripVertical,
} from 'lucide-react';

export interface ComponentPaletteProps {
  onStartDrag: (item: DragItem, e: React.PointerEvent) => void;
  onAddLayout: (layoutType: LayoutType) => void;
  onAddBlock: (blockType: BuilderBlockType) => void;
}

export function ComponentPalette({ onStartDrag, onAddLayout, onAddBlock }: ComponentPaletteProps) {
  const getBlockIcon = (type: BuilderBlockType) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4 text-indigo-400" />;
      case 'heading':
        return <Heading className="w-4 h-4 text-purple-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'button':
        return <MousePointerClick className="w-4 h-4 text-amber-400" />;
      case 'divider':
        return <Minus className="w-4 h-4 text-zinc-400" />;
      case 'spacer':
        return <MoveVertical className="w-4 h-4 text-blue-400" />;
      case 'social':
        return <Share2 className="w-4 h-4 text-rose-400" />;
      case 'logo':
        return <Bookmark className="w-4 h-4 text-cyan-400" />;
      case 'footer':
        return <FileText className="w-4 h-4 text-teal-400" />;
    }
  };

  const getLayoutIcon = (type: string) => {
    if (type === 'section') return <Square className="w-4 h-4 text-indigo-400" />;
    return <Columns className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full overflow-y-auto select-none">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Components</h3>
        <p className="text-[11px] text-zinc-400 mt-0.5">Drag onto canvas or click to add</p>
      </div>

      {/* Layout Components Category */}
      <div className="p-4 border-b border-zinc-800 space-y-3">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
          Layout Structures
        </span>
        <div className="grid grid-cols-1 gap-2">
          {LAYOUT_REGISTRY.map((item) => (
            <div
              key={item.type}
              onClick={() => onAddLayout(item.type as LayoutType)}
              onPointerDown={(e) => onStartDrag({ kind: 'new-layout', layoutType: item.type as LayoutType }, e)}
              className="flex items-center justify-between p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl hover:border-indigo-500/60 hover:bg-indigo-500/5 transition-all cursor-grab active:cursor-grabbing group"
            >
              <div className="flex items-center gap-2.5">
                {getLayoutIcon(item.type)}
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block group-hover:text-indigo-300">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">{item.description}</span>
                </div>
              </div>
              <GripVertical className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Content Blocks Category */}
      <div className="p-4 space-y-3">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
          Content Blocks
        </span>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(BLOCK_REGISTRY) as BuilderBlockType[]).map((type) => {
            const entry = BLOCK_REGISTRY[type];
            return (
              <div
                key={type}
                onClick={() => onAddBlock(type)}
                onPointerDown={(e) => onStartDrag({ kind: 'new-block', blockType: type }, e)}
                className="flex flex-col items-center justify-center p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl hover:border-purple-500/60 hover:bg-purple-500/5 transition-all cursor-grab active:cursor-grabbing text-center group"
              >
                <div className="mb-1.5">{getBlockIcon(type)}</div>
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-purple-300">
                  {entry.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
