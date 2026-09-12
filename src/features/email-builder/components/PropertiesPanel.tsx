'use client';

import React, { useState } from 'react';
import {
  BuilderBlock,
  BuilderColumn,
  BuilderDocument,
  BuilderRow,
  BuilderSection,
  ButtonProps,
  HeadingProps,
  ImageProps,
  SelectedTarget,
  SocialProps,
  TextProps,
} from '../model/types';
import { VariablePickerPopover } from './VariablePickerPopover';
import { Button, Input, Select } from '@/components/ui';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Variable,
  Settings,
  X,
  Trash2,
} from 'lucide-react';

export interface PropertiesPanelProps {
  doc: BuilderDocument;
  selectedTarget: SelectedTarget | null;
  onUpdateDocumentSettings: (settings: Record<string, unknown>) => void;
  onUpdateSectionProps: (sectionId: string, props: Record<string, unknown>) => void;
  onUpdateRowProps: (rowId: string, props: Record<string, unknown>) => void;
  onUpdateColumnProps: (columnId: string, props: Record<string, unknown>) => void;
  onUpdateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  onClose: () => void;
}

const FONT_FAMILIES = [
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial / Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

export function PropertiesPanel({
  doc,
  selectedTarget,
  onUpdateDocumentSettings,
  onUpdateSectionProps,
  onUpdateRowProps,
  onUpdateColumnProps,
  onUpdateBlockProps,
  onClose,
}: PropertiesPanelProps) {
  const [showVarPicker, setShowVarPicker] = useState(false);

  // Resolve selected node
  let targetType: 'document' | 'section' | 'row' | 'column' | 'block' = 'document';
  let selectedSection: BuilderSection | undefined;
  let selectedRow: BuilderRow | undefined;
  let selectedColumn: BuilderColumn | undefined;
  let selectedBlock: BuilderBlock | undefined;

  if (selectedTarget) {
    targetType = selectedTarget.type;
    if (selectedTarget.type === 'section') {
      selectedSection = doc.children.find((s) => s.id === selectedTarget.id);
    } else if (selectedTarget.type === 'row') {
      for (const s of doc.children) {
        const found = s.children.find((r) => r.id === selectedTarget.id);
        if (found) {
          selectedSection = s;
          selectedRow = found;
          break;
        }
      }
    } else if (selectedTarget.type === 'column') {
      for (const s of doc.children) {
        for (const r of s.children) {
          const found = r.columns.find((c) => c.id === selectedTarget.id);
          if (found) {
            selectedSection = s;
            selectedRow = r;
            selectedColumn = found;
            break;
          }
        }
      }
    } else if (selectedTarget.type === 'block') {
      for (const s of doc.children) {
        for (const r of s.children) {
          for (const c of r.columns) {
            const found = c.children.find((b) => b.id === selectedTarget.id);
            if (found) {
              selectedSection = s;
              selectedRow = r;
              selectedColumn = c;
              selectedBlock = found;
              break;
            }
          }
        }
      }
    }
  }

  const handleVariableInsert = (varTag: string) => {
    if (selectedBlock) {
      if (selectedBlock.type === 'text') {
        const current = selectedBlock.props.content || '';
        onUpdateBlockProps(selectedBlock.id, { content: `${current} ${varTag}` });
      } else if (selectedBlock.type === 'heading') {
        const current = selectedBlock.props.text || '';
        onUpdateBlockProps(selectedBlock.id, { text: `${current} ${varTag}` });
      } else if (selectedBlock.type === 'button') {
        const current = selectedBlock.props.text || '';
        onUpdateBlockProps(selectedBlock.id, { text: `${current} ${varTag}` });
      }
    }
    setShowVarPicker(false);
  };

  return (
    <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            {targetType === 'document' ? 'Document Settings' : `${targetType} Properties`}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
          title="Close Properties Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Document Settings */}
        {targetType === 'document' && (
          <div className="space-y-4">
            <Input
              label="Email Canvas Width (px)"
              type="number"
              value={doc.settings.width}
              onChange={(e) => onUpdateDocumentSettings({ width: Number(e.target.value) || 600 })}
              min={320}
              max={900}
            />

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Page Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={doc.settings.backgroundColor}
                  onChange={(e) => onUpdateDocumentSettings({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <Input
                  value={doc.settings.backgroundColor}
                  onChange={(e) => onUpdateDocumentSettings({ backgroundColor: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Content Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={doc.settings.contentBackgroundColor}
                  onChange={(e) => onUpdateDocumentSettings({ contentBackgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <Input
                  value={doc.settings.contentBackgroundColor}
                  onChange={(e) => onUpdateDocumentSettings({ contentBackgroundColor: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <Select
              label="Default Typography"
              value={doc.settings.fontFamily}
              onChange={(e) => onUpdateDocumentSettings({ fontFamily: e.target.value })}
              options={FONT_FAMILIES}
            />

            <Input
              label="Default Container Padding (px)"
              type="number"
              value={doc.settings.padding}
              onChange={(e) => onUpdateDocumentSettings({ padding: Number(e.target.value) || 0 })}
            />
          </div>
        )}

        {/* Section Settings */}
        {targetType === 'section' && selectedSection && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Section Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedSection.props.backgroundColor || '#ffffff'}
                  onChange={(e) => onUpdateSectionProps(selectedSection!.id, { backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <Input
                  value={selectedSection.props.backgroundColor || '#ffffff'}
                  onChange={(e) => onUpdateSectionProps(selectedSection!.id, { backgroundColor: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <Input
              label="Section Padding (px)"
              type="number"
              value={Number(selectedSection.props.padding) || 24}
              onChange={(e) => onUpdateSectionProps(selectedSection!.id, { padding: Number(e.target.value) || 0 })}
            />

            <Input
              label="Border Radius (px)"
              type="number"
              value={Number(selectedSection.props.borderRadius) || 0}
              onChange={(e) => onUpdateSectionProps(selectedSection!.id, { borderRadius: Number(e.target.value) || 0 })}
            />
          </div>
        )}

        {/* Row Settings */}
        {targetType === 'row' && selectedRow && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Mobile Responsive Stacking</span>
                <span className="text-[11px] text-zinc-400 block">Stack columns vertically on mobile screens</span>
              </div>
              <input
                type="checkbox"
                checked={selectedRow.props.mobileStack !== false}
                onChange={(e) => onUpdateRowProps(selectedRow!.id, { mobileStack: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Column Settings */}
        {targetType === 'column' && selectedColumn && (
          <div className="space-y-4">
            <Input
              label="Column Width (%)"
              type="number"
              value={Math.round(selectedColumn.width)}
              disabled
              helperText="Drag visual divider handle on canvas to resize columns"
            />

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Column Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedColumn.props.backgroundColor || '#ffffff'}
                  onChange={(e) => onUpdateColumnProps(selectedColumn!.id, { backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <Input
                  value={selectedColumn.props.backgroundColor || '#ffffff'}
                  onChange={(e) => onUpdateColumnProps(selectedColumn!.id, { backgroundColor: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <Select
              label="Vertical Alignment"
              value={selectedColumn.props.verticalAlign || 'top'}
              onChange={(e) => onUpdateColumnProps(selectedColumn!.id, { verticalAlign: e.target.value })}
              options={[
                { value: 'top', label: 'Top' },
                { value: 'middle', label: 'Middle' },
                { value: 'bottom', label: 'Bottom' },
              ]}
            />
          </div>
        )}

        {/* Block Settings */}
        {targetType === 'block' && selectedBlock && (
          <div className="space-y-4">
            {/* Variable Insert Popover Trigger */}
            {['text', 'heading', 'button'].includes(selectedBlock.type) && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowVarPicker(!showVarPicker)}
                  leftIcon={<Variable className="w-3.5 h-3.5 text-purple-400" />}
                >
                  Insert Variable Tag
                </Button>
                {showVarPicker && (
                  <div className="absolute top-10 left-0 z-50">
                    <VariablePickerPopover
                      onSelectVariable={handleVariableInsert}
                      onClose={() => setShowVarPicker(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Heading Properties */}
            {selectedBlock.type === 'heading' && (
              <>
                <Input
                  label="Heading Text"
                  value={(selectedBlock.props as HeadingProps).text || ''}
                  onChange={(e) => onUpdateBlockProps(selectedBlock!.id, { text: e.target.value })}
                />
                <Select
                  label="Heading Level"
                  value={(selectedBlock.props as HeadingProps).level || 'h2'}
                  onChange={(e) => onUpdateBlockProps(selectedBlock!.id, { level: e.target.value })}
                  options={[
                    { value: 'h1', label: 'H1 - Title' },
                    { value: 'h2', label: 'H2 - Subtitle' },
                    { value: 'h3', label: 'H3 - Section Heading' },
                  ]}
                />
                <Input
                  label="Font Size (px)"
                  type="number"
                  value={(selectedBlock.props as HeadingProps).fontSize || 24}
                  onChange={(e) => onUpdateBlockProps(selectedBlock!.id, { fontSize: Number(e.target.value) || 24 })}
                />
              </>
            )}

            {/* Text Properties */}
            {selectedBlock.type === 'text' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Text Content</label>
                  <textarea
                    value={(selectedBlock.props as TextProps).content || ''}
                    onChange={(e) => onUpdateBlockProps(selectedBlock!.id, { content: e.target.value })}
                    className="w-full h-24 p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-sans text-zinc-200 focus:outline-none focus:border-zinc-700 resize-none"
                  />
                </div>

                {/* Text Formatting Toolbar */}
                <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateBlockProps(selectedBlock!.id, {
                        bold: !(selectedBlock!.props as TextProps).bold,
                      })
                    }
                    className={`p-1.5 rounded transition-colors ${
                      (selectedBlock.props as TextProps).bold
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateBlockProps(selectedBlock!.id, {
                        italic: !(selectedBlock!.props as TextProps).italic,
                      })
                    }
                    className={`p-1.5 rounded transition-colors ${
                      (selectedBlock.props as TextProps).italic
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateBlockProps(selectedBlock!.id, {
                        underline: !(selectedBlock!.props as TextProps).underline,
                      })
                    }
                    className={`p-1.5 rounded transition-colors ${
                      (selectedBlock.props as TextProps).underline
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* Image Properties */}
            {selectedBlock.type === 'image' && (
              <>
                <Input
                  label="Image HTTPS URL *"
                  value={(selectedBlock.props as ImageProps).src || ''}
                  onChange={(e) => onUpdateBlockProps(selectedBlock!.id, { src: e.target.value })}
                />
                <Input
                  label="Alt Text"
                  value={(selectedBlock.props as ImageProps).alt || ''}
                  onChange={(e) => onUpdateBlockProps(selectedBlock!.id, { alt: e.target.value })}
                />
                <Input
                  label="Target Link (Href)"
                  value={(selectedBlock.props as ImageProps).href || ''}
                  onChange={(e) => onUpdateBlockProps(selectedBlock!.id, { href: e.target.value })}
                  placeholder="https://example.com"
                />

                <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">Lock Aspect Ratio</span>
                    <span className="text-[11px] text-zinc-400 block">Preserve proportions when dragging handles</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(selectedBlock.props as ImageProps).aspectRatioLocked !== false}
                    onChange={(e) =>
                      onUpdateBlockProps(selectedBlock!.id, { aspectRatioLocked: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                  />
                </div>
              </>
            )}

            {/* Button Properties */}
            {selectedBlock.type === 'button' && (
              <>
                <Input
                  label="Button Label"
                  value={(selectedBlock.props as ButtonProps).text || ''}
                  onChange={(e) => onUpdateBlockProps(selectedBlock!.id, { text: e.target.value })}
                />
                <Input
                  label="Button URL"
                  value={(selectedBlock.props as ButtonProps).url || ''}
                  onChange={(e) => onUpdateBlockProps(selectedBlock!.id, { url: e.target.value })}
                  placeholder="https://example.com"
                />
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Button Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(selectedBlock.props as ButtonProps).backgroundColor || '#4f46e5'}
                      onChange={(e) =>
                        onUpdateBlockProps(selectedBlock!.id, { backgroundColor: e.target.value })
                      }
                      className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                    />
                    <Input
                      value={(selectedBlock.props as ButtonProps).backgroundColor || '#4f46e5'}
                      onChange={(e) =>
                        onUpdateBlockProps(selectedBlock!.id, { backgroundColor: e.target.value })
                      }
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Social Properties */}
            {selectedBlock.type === 'social' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-zinc-300 block">Controlled Social Platforms</span>
                {((selectedBlock.props as SocialProps).items || []).map((item, idx) => (
                  <div key={idx} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase">
                      <span>{item.platform}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(selectedBlock!.props as SocialProps).items];
                          updated.splice(idx, 1);
                          onUpdateBlockProps(selectedBlock!.id, { items: updated });
                        }}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Input
                      value={item.url}
                      onChange={(e) => {
                        const updated = [...(selectedBlock!.props as SocialProps).items];
                        updated[idx] = { ...updated[idx], url: e.target.value };
                        onUpdateBlockProps(selectedBlock!.id, { items: updated });
                      }}
                      placeholder="https://..."
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Alignment Control for all blocks */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Alignment</label>
              <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onUpdateBlockProps(selectedBlock!.id, { align })}
                    className={`flex-1 py-1.5 rounded flex items-center justify-center transition-colors ${
                      (selectedBlock?.props as { align?: string })?.align === align
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                    {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                    {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
