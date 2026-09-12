'use client';

import React from 'react';
import { BuilderBlock, BuilderColumn } from '../model/types';
import { BlockRenderer } from './BlockRenderer';

export interface CanvasColumnProps {
  column: BuilderColumn;
  columnWidthPx: number;
  selectedBlockId: string | null;
  isSelected: boolean;
  onSelectColumn: () => void;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDropBlockInColumn?: (blockType: string, insertIndex: number) => void;
}

export function CanvasColumn({
  column,
  columnWidthPx,
  selectedBlockId,
  isSelected,
  onSelectColumn,
  onSelectBlock,
  onUpdateBlockProps,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
}: CanvasColumnProps) {
  const pad = typeof column.props.padding === 'number' ? `${column.props.padding}px` : column.props.padding || '12px';
  const bg = column.props.backgroundColor || 'transparent';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectColumn();
      }}
      style={{
        width: `${column.width}%`,
        backgroundColor: bg,
        padding: pad,
        boxSizing: 'border-box',
      }}
      className={`relative min-h-[80px] rounded-lg transition-all ${
        isSelected ? 'ring-2 ring-purple-500 bg-purple-500/5' : 'hover:ring-1 hover:ring-purple-300/40'
      }`}
    >
      {column.children.length === 0 ? (
        <div className="border-2 border-dashed border-zinc-300/80 rounded-lg p-4 text-center text-xs text-zinc-400 select-none bg-zinc-50/50">
          Drop block here
        </div>
      ) : (
        <div className="space-y-3">
          {column.children.map((block: BuilderBlock, idx: number) => (
            <BlockRenderer
              key={block.id}
              block={block}
              columnWidthPx={columnWidthPx * (column.width / 100)}
              isSelected={selectedBlockId === block.id}
              onSelect={() => onSelectBlock(block.id)}
              onUpdateProps={(props) => onUpdateBlockProps(block.id, props)}
              onMoveUp={idx > 0 ? () => onMoveBlock(block.id, 'up') : undefined}
              onMoveDown={idx < column.children.length - 1 ? () => onMoveBlock(block.id, 'down') : undefined}
              onDuplicate={() => onDuplicateBlock(block.id)}
              onDelete={() => onDeleteBlock(block.id)}
              onSelectParent={onSelectColumn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
