'use client';

import React from 'react';
import { BuilderColumn, BuilderRow, BuilderSection } from '../model/types';
import { BlockToolbar } from './BlockToolbar';
import { CanvasRow } from './CanvasRow';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

export interface CanvasSectionProps {
  section: BuilderSection;
  containerWidthPx: number;
  selectedRowId: string | null;
  selectedColumnId: string | null;
  selectedBlockId: string | null;
  isSelected: boolean;
  testDataJson?: string;
  renderMode?: 'raw' | 'rendered';
  onSelectSection: () => void;
  onSelectRow: (rowId: string) => void;
  onSelectColumn: (columnId: string) => void;
  onSelectBlock: (blockId: string) => void;
  onUpdateRowColumns: (rowId: string, newColumns: BuilderColumn[]) => void;
  onUpdateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveSection?: (direction: 'up' | 'down') => void;
  onDuplicateSection?: () => void;
  onDeleteSection?: () => void;
  onAddRow?: (layoutType: 'row-1' | 'row-2' | 'row-3') => void;
}

export function CanvasSection({
  section,
  containerWidthPx,
  selectedRowId,
  selectedColumnId,
  selectedBlockId,
  isSelected,
  testDataJson,
  renderMode,
  onSelectSection,
  onSelectRow,
  onSelectColumn,
  onSelectBlock,
  onUpdateRowColumns,
  onUpdateBlockProps,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onAddRow,
}: CanvasSectionProps) {
  const bg = section.props.backgroundColor || '#ffffff';
  const pad = typeof section.props.padding === 'number' ? `${section.props.padding}px` : section.props.padding || '24px';
  const radius = section.props.borderRadius || 8;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectSection();
      }}
      style={{
        backgroundColor: bg,
        padding: pad,
        borderRadius: `${radius}px`,
      }}
      className={`relative mb-6 transition-all rounded-xl shadow-xs ${
        isSelected
          ? 'ring-2 ring-indigo-500 shadow-lg'
          : 'hover:ring-1 hover:ring-indigo-300/50'
      }`}
    >
      {isSelected && (
        <BlockToolbar
          label="Section"
          onMoveUp={onMoveSection ? () => onMoveSection('up') : undefined}
          onMoveDown={onMoveSection ? () => onMoveSection('down') : undefined}
          onDuplicate={onDuplicateSection}
          onDelete={onDeleteSection}
        />
      )}

      {section.children.length === 0 ? (
        <div className="border-2 border-dashed border-zinc-300 rounded-xl p-6 text-center text-xs text-zinc-400 select-none">
          Empty section. Add a row below.
        </div>
      ) : (
        <div className="space-y-4">
          {section.children.map((row: BuilderRow) => (
            <CanvasRow
              key={row.id}
              row={row}
              rowWidthPx={containerWidthPx - 48}
              selectedColumnId={selectedColumnId}
              selectedBlockId={selectedBlockId}
              isSelected={selectedRowId === row.id}
              testDataJson={testDataJson}
              renderMode={renderMode}
              onSelectRow={() => onSelectRow(row.id)}
              onSelectColumn={onSelectColumn}
              onSelectBlock={onSelectBlock}
              onUpdateRowColumns={(newCols) => onUpdateRowColumns(row.id, newCols)}
              onUpdateBlockProps={onUpdateBlockProps}
              onMoveBlock={onMoveBlock}
              onDuplicateBlock={onDuplicateBlock}
              onDeleteBlock={onDeleteBlock}
            />
          ))}
        </div>
      )}

      {isSelected && onAddRow && (
        <div className="mt-4 pt-3 border-t border-zinc-200/80 flex items-center justify-center gap-2">
          <span className="text-[11px] text-zinc-400 font-medium">Add Row:</span>
          <Button variant="ghost" size="sm" onClick={() => onAddRow('row-1')} leftIcon={<Plus className="w-3 h-3" />}>
            1 Col
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddRow('row-2')} leftIcon={<Plus className="w-3 h-3" />}>
            2 Col
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddRow('row-3')} leftIcon={<Plus className="w-3 h-3" />}>
            3 Col
          </Button>
        </div>
      )}
    </div>
  );
}
