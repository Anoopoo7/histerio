'use client';

import React, { useRef } from 'react';
import { resizeColumns } from '../model/columnResize';
import { BuilderBlockType, BuilderColumn, BuilderRow, DropTarget } from '../model/types';
import { CanvasColumn } from './CanvasColumn';
import { BlockToolbar } from './BlockToolbar';
import { Trash2 } from 'lucide-react';

export interface CanvasRowProps {
  row: BuilderRow;
  rowWidthPx: number;
  selectedColumnId: string | null;
  selectedBlockId: string | null;
  isSelected: boolean;
  testDataJson?: string;
  renderMode?: 'raw' | 'rendered';
  onSelectRow: () => void;
  onSelectColumn: (columnId: string) => void;
  onSelectBlock: (blockId: string) => void;
  onUpdateRowColumns: (newColumns: BuilderColumn[]) => void;
  onUpdateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDeleteRow?: () => void;
  onDuplicateRow?: () => void;
  onSelectParentSection?: () => void;
  onAddBlockToContainer?: (target: DropTarget, blockType: BuilderBlockType) => void;
}

export function CanvasRow({
  row,
  rowWidthPx,
  selectedColumnId,
  selectedBlockId,
  isSelected,
  testDataJson,
  renderMode,
  onSelectRow,
  onSelectColumn,
  onSelectBlock,
  onUpdateRowColumns,
  onUpdateBlockProps,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onDeleteRow,
  onDuplicateRow,
  onSelectParentSection,
  onAddBlockToContainer,
}: CanvasRowProps) {
  const isResizingRef = useRef(false);

  const handlePointerDownDivider = (dividerIndex: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    isResizingRef.current = true;
    const startX = e.clientX;
    const initialColumns = row.columns.map((c) => ({ ...c }));

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!isResizingRef.current) return;
      const deltaX = moveEv.clientX - startX;
      const deltaPercentage = (deltaX / rowWidthPx) * 100;

      const updated = resizeColumns(initialColumns, dividerIndex, deltaPercentage);
      onUpdateRowColumns(updated);
    };

    const handlePointerUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const pad = typeof row.props.padding === 'number' ? `${row.props.padding}px` : row.props.padding || '0px';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectRow();
      }}
      style={{ padding: pad, backgroundColor: row.props.backgroundColor || 'transparent' }}
      className={`relative rounded-xl transition-all group/row w-full ${
        isSelected ? 'ring-2 ring-emerald-500 bg-emerald-500/5' : 'hover:ring-1 hover:ring-emerald-300/40'
      }`}
    >
      {isSelected && (
        <BlockToolbar
          label={`Row (${row.columns.length} col)`}
          onDuplicate={onDuplicateRow}
          onDelete={onDeleteRow}
          onSelectParent={onSelectParentSection}
        />
      )}

      {/* Quick Hover Delete Row button */}
      {!isSelected && onDeleteRow && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRow();
          }}
          className="absolute -top-2.5 right-2 opacity-0 group-hover/row:opacity-100 transition-opacity p-1 rounded-md bg-zinc-900/95 border border-zinc-700/80 text-zinc-400 hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-950/40 z-20 shadow-md"
          title="Delete Row"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="flex flex-wrap md:flex-nowrap items-stretch gap-0 relative">
        {row.columns.map((col, idx) => (
          <React.Fragment key={col.id}>
            <CanvasColumn
              column={col}
              columnWidthPx={rowWidthPx}
              selectedBlockId={selectedBlockId}
              isSelected={selectedColumnId === col.id}
              testDataJson={testDataJson}
              renderMode={renderMode}
              onSelectColumn={() => onSelectColumn(col.id)}
              onSelectBlock={onSelectBlock}
              onUpdateBlockProps={onUpdateBlockProps}
              onMoveBlock={onMoveBlock}
              onDuplicateBlock={onDuplicateBlock}
              onDeleteBlock={onDeleteBlock}
              onAddBlockToContainer={onAddBlockToContainer}
            />

            {/* Draggable Column Divider between columns */}
            {idx < row.columns.length - 1 && (
              <div
                onPointerDown={(e) => handlePointerDownDivider(idx, e)}
                className="w-3 -mx-1.5 z-20 cursor-col-resize flex items-center justify-center group hover:scale-110 select-none"
                title="Drag divider to resize column widths"
              >
                <div className="w-1 h-8 bg-zinc-300 group-hover:bg-indigo-500 rounded-full transition-colors shadow-xs" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
