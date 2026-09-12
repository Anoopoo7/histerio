import React, { useState } from 'react';
import { BuilderColumn, BuilderDocument, BuilderSection, SelectedTarget } from '../model/types';
import { CanvasSection } from './CanvasSection';
import { Code2, Sparkles } from 'lucide-react';

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
  onAddRow,
}: EmailCanvasProps) {
  const [renderMode, setRenderMode] = useState<'raw' | 'rendered'>('rendered');
  const settings = doc.settings;
  const canvasWidth = deviceView === 'mobile' ? 360 : settings.width || 600;

  const selectedSectionId = selectedTarget?.type === 'section' ? selectedTarget.id : null;
  const selectedRowId = selectedTarget?.type === 'row' ? selectedTarget.id : null;
  const selectedColumnId = selectedTarget?.type === 'column' ? selectedTarget.id : null;
  const selectedBlockId = selectedTarget?.type === 'block' ? selectedTarget.id : null;

  return (
    <div
      onClick={() => onSelectTarget({ type: 'document' })}
      style={{ backgroundColor: settings.backgroundColor }}
      className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center select-none"
    >
      {/* Canvas View Mode Toggle Switch */}
      <div className="mb-4 flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl shadow-lg z-10" onClick={(e) => e.stopPropagation()}>
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
      </div>

      <div
        style={{
          width: `${canvasWidth}px`,
          backgroundColor: settings.contentBackgroundColor,
          padding: typeof settings.padding === 'number' ? `${settings.padding}px` : settings.padding || '20px',
        }}
        className={`transition-all duration-300 rounded-2xl shadow-2xl min-h-[600px] border border-zinc-200/80 ${
          selectedTarget?.type === 'document' ? 'ring-2 ring-indigo-500' : ''
        }`}
      >
        {doc.children.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-12 text-center text-xs text-zinc-400">
            Empty Email Document. Drag a Section or Layout structure onto the canvas.
          </div>
        ) : (
          doc.children.map((section: BuilderSection) => (
            <CanvasSection
              key={section.id}
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
              onDeleteSection={
                doc.children.length > 1 ? () => onDeleteSection(section.id) : undefined
              }
              onAddRow={(layoutType) => onAddRow(section.id, layoutType)}
            />
          ))
        )}
      </div>
    </div>
  );
}
