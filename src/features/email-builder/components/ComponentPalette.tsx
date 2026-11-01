'use client';

import React from 'react';
import { BLOCK_REGISTRY, LAYOUT_REGISTRY } from '../model/registry';
import { BuilderBlockType, DragItem, LayoutType, PresetSnippetType } from '../model/types';
import { useBuilderDnd } from '../context/BuilderDndContext';
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
  Sparkles,
  GitFork,
  Repeat,
} from 'lucide-react';

export type { PresetSnippetType };

export interface ComponentPaletteProps {
  onStartDrag?: (item: DragItem, e: React.PointerEvent) => void;
  onAddLayout: (layoutType: LayoutType) => void;
  onAddBlock: (blockType: BuilderBlockType) => void;
  onAddPresetSnippet?: (snippetType: PresetSnippetType) => void;
}

export function ComponentPalette({ onAddLayout, onAddBlock, onAddPresetSnippet }: ComponentPaletteProps) {
  const { startDrag, endDrag, activeDragItem } = useBuilderDnd();

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
      case 'if-else':
        return <GitFork className="w-4 h-4 text-violet-400" />;
      case 'loop':
        return <Repeat className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getLayoutIcon = (type: string) => {
    if (type === 'section') return <Square className="w-4 h-4 text-indigo-400" />;
    return <Columns className="w-4 h-4 text-purple-400" />;
  };

  const contentBlockTypes = (Object.keys(BLOCK_REGISTRY) as BuilderBlockType[]).filter(
    (k) => BLOCK_REGISTRY[k].category === 'content'
  );

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full overflow-y-auto select-none">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center justify-between">
          <span>Components</span>
          <span className="text-[10px] font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            Drag & Drop
          </span>
        </h3>
        <p className="text-[11px] text-zinc-400 mt-1">Drag anywhere on canvas or click to add</p>
      </div>

      {/* Dynamic Logic & Loops Category */}
      <div className="p-4 border-b border-zinc-800 space-y-3 bg-violet-950/10">
        <span className="text-[11px] font-semibold text-violet-300 uppercase tracking-wider block flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Dynamic Logic</span>
          </span>
          <span className="text-[9px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded font-mono">
            Nestable
          </span>
        </span>
        <div className="grid grid-cols-1 gap-2">
          {/* If/Else Block Card */}
          <div
            draggable
            onDragStart={(e) => startDrag({ kind: 'new-block', blockType: 'if-else' }, e)}
            onDragEnd={endDrag}
            onClick={() => onAddBlock('if-else')}
            className={`flex items-center justify-between p-2.5 bg-zinc-950/70 border rounded-xl transition-all cursor-grab active:cursor-grabbing group select-none ${
              activeDragItem?.kind === 'new-block' && activeDragItem.blockType === 'if-else'
                ? 'border-violet-500 bg-violet-500/20 opacity-60'
                : 'border-violet-800/40 hover:border-violet-500/80 hover:bg-violet-500/10 hover:translate-x-0.5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 group-hover:border-violet-400">
                <GitFork className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-100 block group-hover:text-violet-200">
                  If / Else Condition
                </span>
                <span className="text-[10px] text-zinc-400 block font-mono">{"{{#if condition}}"}</span>
              </div>
            </div>
            <GripVertical className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
          </div>

          {/* Loop Block Card */}
          <div
            draggable
            onDragStart={(e) => startDrag({ kind: 'new-block', blockType: 'loop' }, e)}
            onDragEnd={endDrag}
            onClick={() => onAddBlock('loop')}
            className={`flex items-center justify-between p-2.5 bg-zinc-950/70 border rounded-xl transition-all cursor-grab active:cursor-grabbing group select-none ${
              activeDragItem?.kind === 'new-block' && activeDragItem.blockType === 'loop'
                ? 'border-emerald-500 bg-emerald-500/20 opacity-60'
                : 'border-emerald-800/40 hover:border-emerald-500/80 hover:bg-emerald-500/10 hover:translate-x-0.5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 group-hover:border-emerald-400">
                <Repeat className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-100 block group-hover:text-emerald-200">
                  Loop Component
                </span>
                <span className="text-[10px] text-zinc-400 block font-mono">{"{{#each items}}"}</span>
              </div>
            </div>
            <GripVertical className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* Content Blocks Category */}
      <div className="p-4 border-b border-zinc-800 space-y-3">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block flex items-center justify-between">
          <span>Content Blocks</span>
          <span className="text-[10px] text-zinc-500">Drag to insert</span>
        </span>
        <div className="grid grid-cols-2 gap-2">
          {contentBlockTypes.map((type) => {
            const entry = BLOCK_REGISTRY[type];
            const isBeingDragged =
              activeDragItem?.kind === 'new-block' && activeDragItem.blockType === type;

            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => startDrag({ kind: 'new-block', blockType: type }, e)}
                onDragEnd={endDrag}
                onClick={() => onAddBlock(type)}
                className={`flex flex-col items-center justify-center p-3 bg-zinc-950/70 border rounded-xl transition-all cursor-grab active:cursor-grabbing text-center group select-none ${
                  isBeingDragged
                    ? 'border-indigo-500 bg-indigo-500/20 opacity-60 scale-95'
                    : 'border-zinc-800 hover:border-purple-500/60 hover:bg-purple-500/5 hover:scale-[1.02]'
                }`}
              >
                <div className="mb-1.5 transition-transform group-hover:scale-110">{getBlockIcon(type)}</div>
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-purple-300">
                  {entry.label}
                </span>
                <span className="text-[9px] text-zinc-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Drag or click
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layout Components Category */}
      <div className="p-4 border-b border-zinc-800 space-y-3">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
          Layout Structures
        </span>
        <div className="grid grid-cols-1 gap-2">
          {LAYOUT_REGISTRY.map((item) => {
            const isBeingDragged =
              activeDragItem?.kind === 'new-layout' && activeDragItem.layoutType === item.type;

            return (
              <div
                key={item.type}
                draggable
                onDragStart={(e) =>
                  startDrag({ kind: 'new-layout', layoutType: item.type as LayoutType }, e)
                }
                onDragEnd={endDrag}
                onClick={() => onAddLayout(item.type as LayoutType)}
                className={`flex items-center justify-between p-2.5 bg-zinc-950/70 border rounded-xl transition-all cursor-grab active:cursor-grabbing group select-none ${
                  isBeingDragged
                    ? 'border-indigo-500 bg-indigo-500/20 opacity-60'
                    : 'border-zinc-800 hover:border-indigo-500/60 hover:bg-indigo-500/5 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-indigo-500/40">
                    {getLayoutIcon(item.type)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block group-hover:text-indigo-300">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">{item.description}</span>
                  </div>
                </div>
                <GripVertical className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic & Loop Snippets Category */}
      <div className="p-4 space-y-3">
        <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Dynamic Snippets</span>
          </span>
          <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded font-mono">
            Handlebars
          </span>
        </span>
        <div className="grid grid-cols-1 gap-2">
          <div
            draggable
            onDragStart={(e) =>
              startDrag({ kind: 'new-preset', snippetType: 'order-summary-table' }, e)
            }
            onDragEnd={endDrag}
            onClick={() => onAddPresetSnippet?.('order-summary-table')}
            className="p-2.5 bg-purple-950/30 border border-purple-800/40 rounded-xl hover:border-purple-500 hover:bg-purple-500/10 transition-all cursor-grab active:cursor-grabbing group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-200 group-hover:text-purple-100 flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5 text-purple-400/60 group-hover:text-purple-300" />
                Recursive Items Table
              </span>
              <span className="text-[10px] text-purple-400 font-mono">{"{{#each order.items}}"}</span>
            </div>
            <span className="text-[10px] text-zinc-400 block mt-1 ml-5">
              Loops over order items, prices, quantities, and totals
            </span>
          </div>

          <div
            draggable
            onDragStart={(e) =>
              startDrag({ kind: 'new-preset', snippetType: 'customer-greeting' }, e)
            }
            onDragEnd={endDrag}
            onClick={() => onAddPresetSnippet?.('customer-greeting')}
            className="p-2.5 bg-indigo-950/30 border border-indigo-800/40 rounded-xl hover:border-indigo-500 hover:bg-indigo-500/10 transition-all cursor-grab active:cursor-grabbing group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-200 group-hover:text-indigo-100 flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5 text-indigo-400/60 group-hover:text-indigo-300" />
                Customer & Order Header
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">{"{{customer.name}}"}</span>
            </div>
            <span className="text-[10px] text-zinc-400 block mt-1 ml-5">
              Header with customer name, order ID & status
            </span>
          </div>

          <div
            draggable
            onDragStart={(e) =>
              startDrag({ kind: 'new-preset', snippetType: 'receipt-callout' }, e)
            }
            onDragEnd={endDrag}
            onClick={() => onAddPresetSnippet?.('receipt-callout')}
            className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl hover:border-emerald-500 hover:bg-emerald-500/10 transition-all cursor-grab active:cursor-grabbing group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200 group-hover:text-emerald-100 flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5 text-emerald-400/60 group-hover:text-emerald-300" />
                Receipt Total Callout
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">{"{{order.total}}"}</span>
            </div>
            <span className="text-[10px] text-zinc-400 block mt-1 ml-5">
              Highlighted banner with grand total and action button
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
