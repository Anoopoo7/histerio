'use client';

import React from 'react';
import { BuilderBlock, BuilderColumn } from '../model/types';
import { BlockRenderer } from './BlockRenderer';
import { useBuilderDnd } from '../context/BuilderDndContext';
import { Plus } from 'lucide-react';

export interface CanvasColumnProps {
  column: BuilderColumn;
  columnWidthPx: number;
  selectedBlockId: string | null;
  isSelected: boolean;
  testDataJson?: string;
  renderMode?: 'raw' | 'rendered';
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
  testDataJson,
  renderMode,
  onSelectColumn,
  onSelectBlock,
  onUpdateBlockProps,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
}: CanvasColumnProps) {
  const { activeDropTarget, isDragging, handleDragOver, handleDragLeave, handleDrop } =
    useBuilderDnd();

  const pad = typeof column.props.padding === 'number' ? `${column.props.padding}px` : column.props.padding || '12px';
  const bg = column.props.backgroundColor || 'transparent';

  const isColumnTarget =
    activeDropTarget?.type === 'column' && activeDropTarget.columnId === column.id;

  const renderDropIndicator = (slotIndex: number) => {
    if (!isColumnTarget || activeDropTarget?.index !== slotIndex) return null;
    return (
      <div className="py-1 my-0.5 transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none">
        <div className="h-1 bg-indigo-500 rounded-full shadow-md shadow-indigo-500/50 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-white shadow-xs" />
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectColumn();
      }}
      onDragOver={(e) => {
        // If empty or dragging over column padding, target last index
        if (column.children.length === 0) {
          handleDragOver({ type: 'column', columnId: column.id, index: 0 }, e);
        }
      }}
      style={{
        width: `${column.width}%`,
        backgroundColor: bg,
        padding: pad,
        boxSizing: 'border-box',
      }}
      className={`relative min-h-[80px] rounded-lg transition-all ${
        isColumnTarget
          ? 'ring-2 ring-indigo-400 bg-indigo-500/10'
          : isSelected
          ? 'ring-2 ring-purple-500 bg-purple-500/5'
          : 'hover:ring-1 hover:ring-purple-300/40'
      }`}
    >
      {column.children.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDragOver({ type: 'column', columnId: column.id, index: 0 }, e);
          }}
          onDragLeave={(e) => handleDragLeave({ type: 'column', columnId: column.id, index: 0 }, e)}
          onDrop={(e) => handleDrop({ type: 'column', columnId: column.id, index: 0 }, e)}
          className={`border-2 border-dashed rounded-lg p-6 text-center text-xs transition-all select-none ${
            isColumnTarget
              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 scale-[1.02]'
              : 'border-zinc-300/80 bg-zinc-50/50 text-zinc-400 hover:border-zinc-400'
          }`}
        >
          <Plus className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
          <span>Drop component here</span>
        </div>
      ) : (
        <div className="space-y-2">
          {column.children.map((block: BuilderBlock, idx: number) => (
            <React.Fragment key={block.id}>
              {/* Drop slot before this block */}
              {renderDropIndicator(idx)}

              <BlockRenderer
                block={block}
                columnId={column.id}
                index={idx}
                columnWidthPx={columnWidthPx * (column.width / 100)}
                isSelected={selectedBlockId === block.id}
                testDataJson={testDataJson}
                renderMode={renderMode}
                onSelect={() => onSelectBlock(block.id)}
                onUpdateProps={(props) => onUpdateBlockProps(block.id, props)}
                onMoveUp={idx > 0 ? () => onMoveBlock(block.id, 'up') : undefined}
                onMoveDown={idx < column.children.length - 1 ? () => onMoveBlock(block.id, 'down') : undefined}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                onSelectParent={onSelectColumn}
              />
            </React.Fragment>
          ))}

          {/* Drop slot after the last block */}
          {renderDropIndicator(column.children.length)}

          {/* Bottom drop strip for quick appending */}
          {isDragging && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(
                  { type: 'column', columnId: column.id, index: column.children.length },
                  e
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDrop(
                  { type: 'column', columnId: column.id, index: column.children.length },
                  e
                );
              }}
              className={`py-1.5 text-center text-[10px] rounded-lg border border-dashed transition-all ${
                isColumnTarget && activeDropTarget.index === column.children.length
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 font-semibold'
                  : 'border-indigo-500/20 text-zinc-400 hover:border-indigo-500/50'
              }`}
            >
              + Drop here to append
            </div>
          )}
        </div>
      )}
    </div>
  );
}
