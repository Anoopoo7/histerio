'use client';

import React from 'react';
import { BuilderColumn, BuilderRow, BuilderSection } from '../model/types';
import { BlockToolbar } from './BlockToolbar';
import { CanvasRow } from './CanvasRow';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import { useBuilderDnd } from '../context/BuilderDndContext';

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
  const { startDrag, activeDragItem, activeDropTarget, handleDragOver, handleDrop } =
    useBuilderDnd();

  const bg = section.props.backgroundColor || '#ffffff';
  const pad = typeof section.props.padding === 'number' ? `${section.props.padding}px` : section.props.padding || '24px';
  const radius = section.props.borderRadius || 8;

  const isDraggingThisSection =
    activeDragItem?.kind === 'move-section' && activeDragItem.sectionId === section.id;

  const isSectionTarget =
    activeDropTarget?.type === 'section' && activeDropTarget.sectionId === section.id;

  const handleDragStartSection = (e: React.DragEvent) => {
    startDrag({ kind: 'move-section', sectionId: section.id }, e);
  };

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
      className={`relative mb-6 transition-all rounded-xl shadow-xs select-none ${
        isDraggingThisSection
          ? 'opacity-40 border-2 border-dashed border-indigo-500 scale-[0.99]'
          : isSectionTarget
          ? 'ring-2 ring-indigo-400'
          : isSelected
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
          onDragStartHandle={handleDragStartSection}
        />
      )}

      {section.children.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDragOver({ type: 'section', sectionId: section.id, index: 0 }, e);
          }}
          onDrop={(e) => handleDrop({ type: 'section', sectionId: section.id, index: 0 }, e)}
          className={`border-2 border-dashed rounded-xl p-6 text-center text-xs transition-all ${
            isSectionTarget
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
              : 'border-zinc-300 text-zinc-400'
          }`}
        >
          Empty section. Drag a layout or block here.
        </div>
      ) : (
        <div className="space-y-4">
          {section.children.map((row: BuilderRow, rIdx: number) => (
            <React.Fragment key={row.id}>
              {/* Row drop indicator */}
              {isSectionTarget && activeDropTarget?.index === rIdx && (
                <div className="py-1 my-0.5">
                  <div className="h-1 bg-indigo-500 rounded-full shadow-md flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-white" />
                  </div>
                </div>
              )}

              <CanvasRow
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
            </React.Fragment>
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
