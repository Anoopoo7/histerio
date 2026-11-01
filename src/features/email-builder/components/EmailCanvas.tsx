import React, { useState } from 'react';
import { BuilderColumn, BuilderDocument, BuilderSection, SelectedTarget } from '../model/types';
import { CanvasSection } from './CanvasSection';
import { Code2, Sparkles, Plus, Maximize2 } from 'lucide-react';
import { useBuilderDnd } from '../context/BuilderDndContext';

export interface EmailCanvasProps {
  doc: BuilderDocument;
  selectedTarget: SelectedTarget | null;
  deviceView: 'desktop' | 'mobile';
  testDataJson?: string;
  onSelectTarget: (target: SelectedTarget | null) => void;
  onUpdateRowColumns: (rowId: string, newColumns: BuilderColumn[]) => void;
  onUpdateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteRow?: (rowId: string) => void;
  onDuplicateRow?: (rowId: string) => void;
  onAddRow: (sectionId: string, layoutType: 'row-1' | 'row-2' | 'row-3') => void;
}

export function EmailCanvas({
  doc,
  selectedTarget,
  deviceView,
  testDataJson,
  onSelectTarget,
  onUpdateRowColumns,
  onUpdateBlockProps,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onDeleteRow,
  onDuplicateRow,
  onAddRow,
}: EmailCanvasProps) {
  const [renderMode, setRenderMode] = useState<'raw' | 'rendered'>('rendered');
  const { isDragging, activeDropTarget, handleDragOver, handleDrop } = useBuilderDnd();

  const settings = doc.settings;
  const canvasWidth = deviceView === 'mobile' ? 360 : settings.width || 600;

  const selectedSectionId = selectedTarget?.type === 'section' ? selectedTarget.id : null;
  const selectedRowId = selectedTarget?.type === 'row' ? selectedTarget.id : null;
  const selectedColumnId = selectedTarget?.type === 'column' ? selectedTarget.id : null;
  const selectedBlockId = selectedTarget?.type === 'block' ? selectedTarget.id : null;

  const isDocTarget = activeDropTarget?.type === 'document';

  const renderSectionDropIndicator = (slotIndex: number) => {
    if (!isDocTarget || activeDropTarget?.index !== slotIndex) return null;
    return (
      <div className="py-2 my-1 transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none w-full">
        <div className="h-1.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50 flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-white shadow-xs" />
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={() => onSelectTarget({ type: 'document' })}
      style={{ backgroundColor: settings.backgroundColor }}
      className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 flex flex-col items-center select-none"
    >
      {/* Canvas View Mode Toggle Switch & Dimension Badge */}
      <div
        className="mb-4 flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl shadow-lg z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setRenderMode('rendered')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            renderMode === 'rendered'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Evaluate Handlebars tags using Test JSON Payload"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Evaluated Payload</span>
        </button>
        <button
          type="button"
          onClick={() => setRenderMode('raw')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            renderMode === 'raw'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Show raw Handlebars tags like {{order.name}}"
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Raw Tags {"{{...}}"}</span>
        </button>

        <div
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-zinc-400 border-l border-zinc-800"
          title="Controlled Canvas Width"
        >
          <Maximize2 className="w-3 h-3 text-zinc-500" />
          <span>{canvasWidth}px</span>
        </div>
      </div>

      {/* Canvas Box: Controlled horizontal width, vertically grows with components */}
      <div
        style={{
          width: `${canvasWidth}px`,
          maxWidth: `${canvasWidth}px`,
          height: 'fit-content',
          minHeight: '360px',
          backgroundColor: settings.contentBackgroundColor,
          padding: typeof settings.padding === 'number' ? `${settings.padding}px` : settings.padding || '24px',
          boxSizing: 'border-box',
        }}
        className={`transition-[box-shadow,border-color] duration-200 rounded-2xl shadow-2xl border border-zinc-200/80 flex flex-col mb-24 shrink-0 overflow-hidden ${
          selectedTarget?.type === 'document' ? 'ring-2 ring-indigo-500 shadow-indigo-500/10' : ''
        }`}
      >
        {doc.children.length === 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragOver({ type: 'document', index: 0 }, e);
            }}
            onDrop={(e) => handleDrop({ type: 'document', index: 0 }, e)}
            className={`border-2 border-dashed rounded-2xl p-12 text-center text-xs transition-all ${
              isDocTarget && activeDropTarget.index === 0
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 scale-[1.01]'
                : 'border-zinc-300 text-zinc-400'
            }`}
          >
            <Plus className="w-8 h-8 mx-auto mb-2 text-indigo-400 opacity-60" />
            <p className="font-semibold text-sm text-zinc-300">Empty Email Document</p>
            <p className="mt-1 text-zinc-400">Drag a layout structure, snippet, or content block right here</p>
          </div>
        ) : (
          <>
            {doc.children.map((section: BuilderSection, sIdx: number) => (
              <React.Fragment key={section.id}>
                {/* Drop indicator before this section */}
                {renderSectionDropIndicator(sIdx)}

                <CanvasSection
                  section={section}
                  containerWidthPx={canvasWidth}
                  selectedRowId={selectedRowId}
                  selectedColumnId={selectedColumnId}
                  selectedBlockId={selectedBlockId}
                  isSelected={selectedSectionId === section.id}
                  testDataJson={testDataJson}
                  renderMode={renderMode}
                  onSelectSection={() => onSelectTarget({ type: 'section', id: section.id })}
                  onSelectRow={(rowId) => onSelectTarget({ type: 'row', id: rowId, sectionId: section.id })}
                  onSelectColumn={(colId) =>
                    onSelectTarget({ type: 'column', id: colId, rowId: '', sectionId: section.id })
                  }
                  onSelectBlock={(blockId) =>
                    onSelectTarget({ type: 'block', id: blockId, columnId: '', rowId: '', sectionId: section.id })
                  }
                  onUpdateRowColumns={onUpdateRowColumns}
                  onUpdateBlockProps={onUpdateBlockProps}
                  onMoveBlock={onMoveBlock}
                  onDuplicateBlock={onDuplicateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onMoveSection={
                    doc.children.length > 1
                      ? (dir) => onMoveSection(section.id, dir)
                      : undefined
                  }
                  onDuplicateSection={() => onDuplicateSection(section.id)}
                  onDeleteSection={() => onDeleteSection(section.id)}
                  onDeleteRow={onDeleteRow}
                  onDuplicateRow={onDuplicateRow}
                  onAddRow={(layoutType) => onAddRow(section.id, layoutType)}
                />
              </React.Fragment>
            ))}

            {/* Drop indicator after last section */}
            {renderSectionDropIndicator(doc.children.length)}

            {/* Bottom canvas drop strip */}
            {isDragging && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDragOver({ type: 'document', index: doc.children.length }, e);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDrop({ type: 'document', index: doc.children.length }, e);
                }}
                className={`py-3 text-center text-xs rounded-xl border-2 border-dashed transition-all w-full ${
                  isDocTarget && activeDropTarget.index === doc.children.length
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 font-semibold'
                    : 'border-zinc-300/60 text-zinc-400 hover:border-indigo-400/50'
                }`}
              >
                + Drop here to add to bottom of email
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
