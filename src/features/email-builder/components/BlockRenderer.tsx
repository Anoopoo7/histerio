'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState, useEffect } from 'react';
import {
  BuilderBlock,
  BuilderBlockType,
  ButtonProps,
  DividerProps,
  DropTarget,
  FooterProps,
  HeadingProps,
  ImageProps,
  LogoProps,
  SocialProps,
  SpacerProps,
  TextProps,
} from '../model/types';
import { BlockToolbar } from './BlockToolbar';
import {
  evaluateCondition,
  replaceVariablesWithMockData,
  resolveIterable,
} from '../utils/variableUtils';
import { useBuilderDnd } from '../context/BuilderDndContext';
import {
  GripVertical,
  Trash2,
  GitFork,
  Repeat,
  Plus,
  CheckCircle2,
  XCircle,
  Heading as HeadingIcon,
  Image as ImageIcon,
  Type as TextIcon,
  MousePointerClick,
  Minus,
  MoveVertical,
  Share2,
  Bookmark,
  FileText,
} from 'lucide-react';

export type ContainerTarget =
  | { type: 'column'; columnId: string }
  | { type: 'if-branch'; blockId: string; branch: 'then' | 'else' }
  | { type: 'loop'; blockId: string };

export interface BlockRendererProps {
  block: BuilderBlock;
  columnId: string;
  containerTarget?: ContainerTarget;
  index: number;
  columnWidthPx: number;
  isSelected: boolean;
  selectedBlockId?: string | null;
  testDataJson?: string;
  renderMode?: 'raw' | 'rendered';
  onSelect: () => void;
  onSelectBlockById?: (blockId: string) => void;
  onUpdateProps: (props: Record<string, unknown>) => void;
  onUpdateBlockPropsById?: (blockId: string, props: Record<string, unknown>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMoveBlockById?: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlockById?: (blockId: string) => void;
  onDeleteBlockById?: (blockId: string) => void;
  onSelectParent?: () => void;
  onAddBlockToContainer?: (target: DropTarget, blockType: BuilderBlockType) => void;
}

function QuickAddDropdown({
  label,
  onAdd,
  themeColor = 'indigo',
}: {
  label: string;
  onAdd: (type: BuilderBlockType) => void;
  themeColor?: 'indigo' | 'violet' | 'emerald';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const items: Array<{ type: BuilderBlockType; label: string; icon: React.ReactNode }> = [
    { type: 'heading', label: 'Heading', icon: <HeadingIcon className="w-3.5 h-3.5 text-purple-400" /> },
    { type: 'text', label: 'Text Body', icon: <TextIcon className="w-3.5 h-3.5 text-indigo-400" /> },
    { type: 'image', label: 'Image', icon: <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> },
    { type: 'button', label: 'Button', icon: <MousePointerClick className="w-3.5 h-3.5 text-amber-400" /> },
    { type: 'divider', label: 'Divider', icon: <Minus className="w-3.5 h-3.5 text-zinc-400" /> },
    { type: 'spacer', label: 'Spacer', icon: <MoveVertical className="w-3.5 h-3.5 text-blue-400" /> },
    { type: 'if-else', label: 'If / Else Condition', icon: <GitFork className="w-3.5 h-3.5 text-violet-400" /> },
    { type: 'loop', label: 'Loop (Each)', icon: <Repeat className="w-3.5 h-3.5 text-emerald-400" /> },
    { type: 'social', label: 'Social Icons', icon: <Share2 className="w-3.5 h-3.5 text-rose-400" /> },
    { type: 'logo', label: 'Logo', icon: <Bookmark className="w-3.5 h-3.5 text-cyan-400" /> },
    { type: 'footer', label: 'Footer', icon: <FileText className="w-3.5 h-3.5 text-teal-400" /> },
  ];

  const btnBg =
    themeColor === 'violet'
      ? 'bg-violet-600 hover:bg-violet-500'
      : themeColor === 'emerald'
      ? 'bg-emerald-600 hover:bg-emerald-500'
      : 'bg-indigo-600 hover:bg-indigo-500';

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-white ${btnBg} rounded-lg shadow-sm transition-all cursor-pointer`}
        title="Add component directly inside"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1.5 w-52 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95"
        >
          <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 mb-1">
            Choose Component
          </div>
          <div className="max-h-60 overflow-y-auto py-0.5 space-y-0.5">
            {items.map((it) => (
              <button
                key={it.type}
                type="button"
                onClick={() => {
                  onAdd(it.type);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer group"
              >
                <div className="p-1 rounded bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700">
                  {it.icon}
                </div>
                <span className="font-medium">{it.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BlockRenderer({
  block,
  columnId,
  containerTarget,
  index,
  columnWidthPx,
  isSelected,
  selectedBlockId,
  testDataJson,
  renderMode = 'raw',
  onSelect,
  onSelectBlockById,
  onUpdateProps,
  onUpdateBlockPropsById,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onMoveBlockById,
  onDuplicateBlockById,
  onDeleteBlockById,
  onSelectParent,
  onAddBlockToContainer,
}: BlockRendererProps) {
  const isResizingImageRef = useRef(false);
  const {
    startDrag,
    endDrag,
    activeDragItem,
    activeDropTarget,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useBuilderDnd();

  const isDynamicContainer = block.type === 'if-else' || block.type === 'loop';

  const currentContainer: ContainerTarget =
    containerTarget || { type: 'column', columnId };

  const isThisBlockDragging =
    activeDragItem?.kind === 'move-block' && activeDragItem.blockId === block.id;

  const evalText = (rawStr: string | undefined | null) => {
    if (!rawStr) return '';
    if (renderMode === 'rendered' && testDataJson) {
      return replaceVariablesWithMockData(rawStr, testDataJson);
    }
    return rawStr;
  };

  const handleDragStartBlock = (e: React.DragEvent) => {
    startDrag({ kind: 'move-block', blockId: block.id, sourceColumnId: columnId }, e);
  };

  const handleDragOverBlock = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const targetIndex = e.clientY < midY ? index : index + 1;

    if (currentContainer.type === 'column') {
      handleDragOver({ type: 'column', columnId: currentContainer.columnId, index: targetIndex }, e);
    } else if (currentContainer.type === 'if-branch') {
      handleDragOver(
        { type: 'if-branch', blockId: currentContainer.blockId, branch: currentContainer.branch, index: targetIndex },
        e
      );
    } else if (currentContainer.type === 'loop') {
      handleDragOver({ type: 'loop', blockId: currentContainer.blockId, index: targetIndex }, e);
    }
  };

  const handleDropOnBlock = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const targetIndex = e.clientY < midY ? index : index + 1;

    if (currentContainer.type === 'column') {
      handleDrop({ type: 'column', columnId: currentContainer.columnId, index: targetIndex }, e);
    } else if (currentContainer.type === 'if-branch') {
      handleDrop(
        { type: 'if-branch', blockId: currentContainer.blockId, branch: currentContainer.branch, index: targetIndex },
        e
      );
    } else if (currentContainer.type === 'loop') {
      handleDrop({ type: 'loop', blockId: currentContainer.blockId, index: targetIndex }, e);
    }
  };

  const handlePointerDownResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (block.type !== 'image') return;

    isResizingImageRef.current = true;
    const startX = e.clientX;
    const initialWidth = block.props.width || 300;
    const aspectRatioLocked = block.props.aspectRatioLocked !== false;
    const initialHeight = block.props.height || Math.round(initialWidth * 0.6);
    const ratio = initialWidth > 0 ? initialHeight / initialWidth : 0.6;

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!isResizingImageRef.current) return;
      const deltaX = moveEv.clientX - startX;
      let newWidth = Math.round(initialWidth + deltaX);

      const maxAllowed = Math.max(80, columnWidthPx - 24);
      if (newWidth < 40) newWidth = 40;
      if (newWidth > maxAllowed) newWidth = maxAllowed;

      const updates: Record<string, unknown> = { width: newWidth };
      if (aspectRatioLocked) {
        updates.height = Math.round(newWidth * ratio);
      }
      onUpdateProps(updates);
    };

    const handlePointerUp = () => {
      isResizingImageRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const renderSlotIndicator = (isActive: boolean) => {
    if (!isActive) return null;
    return (
      <div className="py-1 my-0.5 transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none">
        <div className="h-1 bg-indigo-500 rounded-full shadow-md shadow-indigo-500/50 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-white shadow-xs" />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (block.type) {
      case 'heading': {
        const p = block.props as HeadingProps;
        const TagName = p.level || 'h2';
        const displayText = evalText(p.text || 'Heading Title');
        return (
          <TagName
            style={{
              margin: 0,
              fontSize: `${p.fontSize || 24}px`,
              fontWeight: p.fontWeight || '700',
              fontFamily: p.fontFamily || 'Arial, sans-serif',
              color: p.color || '#111827',
              textAlign: p.align || 'left',
              lineHeight: p.lineHeight || 1.3,
            }}
          >
            {displayText}
          </TagName>
        );
      }

      case 'text': {
        const p = block.props as TextProps;
        const displayContent = evalText(p.content || '');
        return (
          <div
            style={{
              fontSize: `${p.fontSize || 15}px`,
              fontFamily: p.fontFamily || 'Arial, sans-serif',
              fontWeight: p.fontWeight || '400',
              fontStyle: p.fontStyle || 'normal',
              color: p.color || '#374151',
              textAlign: p.align || 'left',
              lineHeight: p.lineHeight || 1.6,
              backgroundColor: p.backgroundColor || 'transparent',
              padding: typeof p.padding === 'number' ? `${p.padding}px` : p.padding || '0px',
            }}
          >
            {p.bold ? <strong>{displayContent}</strong> : displayContent}
          </div>
        );
      }

      case 'image': {
        const p = block.props as ImageProps;
        const displayWidth = Math.min(p.width || 300, columnWidthPx - 24);
        return (
          <div className="relative inline-block" style={{ textAlign: p.align || 'center', width: '100%' }}>
            <div className="relative inline-block max-w-full">
              <img
                src={evalText(p.src)}
                alt={evalText(p.alt || 'Email Image')}
                style={{
                  width: `${displayWidth}px`,
                  height: p.height ? `${p.height}px` : 'auto',
                  borderRadius: `${p.borderRadius || 0}px`,
                  display: 'block',
                  margin: p.align === 'center' ? '0 auto' : p.align === 'right' ? '0 0 0 auto' : '0',
                }}
              />
              {isSelected && (
                <div
                  onPointerDown={handlePointerDownResize}
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full cursor-se-resize z-40 shadow-md hover:scale-125 transition-transform"
                  title="Drag to resize image dimensions"
                />
              )}
            </div>
          </div>
        );
      }

      case 'button': {
        const p = block.props as ButtonProps;
        const displayText = evalText(p.text || 'Button');
        return (
          <div style={{ textAlign: p.align || 'center' }}>
            <span
              style={{
                display: p.fullWidth ? 'block' : 'inline-block',
                backgroundColor: p.backgroundColor || '#4f46e5',
                color: p.textColor || '#ffffff',
                fontSize: `${p.fontSize || 15}px`,
                fontWeight: p.fontWeight || '600',
                borderRadius: `${p.borderRadius || 6}px`,
                padding: '12px 24px',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              {displayText}
            </span>
          </div>
        );
      }

      case 'divider': {
        const p = block.props as DividerProps;
        return (
          <div style={{ padding: `${p.spacing || 16}px 0`, textAlign: p.align || 'center' }}>
            <hr
              style={{
                border: 'none',
                borderTop: `${p.thickness || 1}px solid ${p.color || '#e5e7eb'}`,
                width: `${p.width || 100}%`,
                margin: p.align === 'center' ? '0 auto' : p.align === 'right' ? '0 0 0 auto' : '0',
              }}
            />
          </div>
        );
      }

      case 'spacer': {
        const p = block.props as SpacerProps;
        return <div style={{ height: `${p.height || 24}px` }} />;
      }

      case 'social': {
        const p = block.props as SocialProps;
        return (
          <div
            style={{
              display: 'flex',
              gap: `${p.spacing || 12}px`,
              justifyContent: p.align === 'center' ? 'center' : p.align === 'right' ? 'flex-end' : 'flex-start',
              color: p.color || '#4b5563',
            }}
          >
            {(p.items || []).map((item) => (
              <span
                key={item.platform}
                className="px-2 py-1 bg-zinc-100 border border-zinc-200 text-xs font-semibold rounded text-zinc-700"
              >
                {item.label || item.platform}
              </span>
            ))}
          </div>
        );
      }

      case 'logo': {
        const p = block.props as LogoProps;
        return (
          <div style={{ textAlign: p.align || 'center' }}>
            <img
              src={p.src}
              alt={p.alt || 'Logo'}
              style={{
                width: `${p.width || 140}px`,
                height: 'auto',
                display: 'inline-block',
              }}
            />
          </div>
        );
      }

      case 'footer': {
        const p = block.props as FooterProps;
        return (
          <div
            style={{
              textAlign: p.align || 'center',
              fontSize: `${p.fontSize || 12}px`,
              color: p.color || '#6b7280',
              lineHeight: 1.5,
            }}
          >
            <p style={{ margin: 0 }}>{p.text}</p>
            {p.companyAddress && <p style={{ margin: '4px 0 0 0' }}>{p.companyAddress}</p>}
            {p.unsubscribeText && (
              <p style={{ margin: '4px 0 0 0', textDecoration: 'underline' }}>{p.unsubscribeText}</p>
            )}
          </div>
        );
      }

      // Dynamic Component: If / Else Condition
      case 'if-else': {
        const cond = block.props.condition || 'condition';
        const showElse = block.props.showElse !== false;
        const thenChildren = block.thenChildren || [];
        const elseChildren = block.elseChildren || [];

        // Evaluated preview mode
        if (renderMode === 'rendered') {
          const isTrue = evaluateCondition(cond, testDataJson);

          return (
            <div className="rounded-xl border border-violet-500/40 bg-violet-950/5 p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-violet-500/20 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-violet-300">
                  <GitFork className="w-4 h-4 text-violet-400" />
                  <span>IF:</span>
                  <span className="font-mono bg-violet-500/10 px-2 py-0.5 rounded text-violet-200">
                    {cond}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium">
                  {isTrue ? (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Evaluated True (THEN branch)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <XCircle className="w-3 h-3" /> Evaluated False {showElse ? '(ELSE branch)' : '(Hidden)'}
                    </span>
                  )}
                </div>
              </div>

              {isTrue ? (
                <div className="space-y-2">
                  {thenChildren.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-400 italic">Empty THEN branch</div>
                  ) : (
                    thenChildren.map((child, cIdx) => (
                      <BlockRenderer
                        key={child.id}
                        block={child}
                        columnId={columnId}
                        containerTarget={{ type: 'if-branch', blockId: block.id, branch: 'then' }}
                        index={cIdx}
                        columnWidthPx={columnWidthPx}
                        isSelected={selectedBlockId === child.id}
                        selectedBlockId={selectedBlockId}
                        testDataJson={testDataJson}
                        renderMode={renderMode}
                        onSelect={() => (onSelectBlockById ? onSelectBlockById(child.id) : onSelect())}
                        onSelectBlockById={onSelectBlockById}
                        onUpdateProps={(props) =>
                          onUpdateBlockPropsById ? onUpdateBlockPropsById(child.id, props) : onUpdateProps(props)
                        }
                        onUpdateBlockPropsById={onUpdateBlockPropsById}
                        onMoveUp={cIdx > 0 ? () => onMoveBlockById?.(child.id, 'up') : undefined}
                        onMoveDown={cIdx < thenChildren.length - 1 ? () => onMoveBlockById?.(child.id, 'down') : undefined}
                        onDuplicate={() => onDuplicateBlockById?.(child.id)}
                        onDelete={() => onDeleteBlockById?.(child.id)}
                        onMoveBlockById={onMoveBlockById}
                        onDuplicateBlockById={onDuplicateBlockById}
                        onDeleteBlockById={onDeleteBlockById}
                        onSelectParent={onSelect}
                        onAddBlockToContainer={onAddBlockToContainer}
                      />
                    ))
                  )}
                </div>
              ) : showElse ? (
                <div className="space-y-2">
                  {elseChildren.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-400 italic">Empty ELSE branch</div>
                  ) : (
                    elseChildren.map((child, cIdx) => (
                      <BlockRenderer
                        key={child.id}
                        block={child}
                        columnId={columnId}
                        containerTarget={{ type: 'if-branch', blockId: block.id, branch: 'else' }}
                        index={cIdx}
                        columnWidthPx={columnWidthPx}
                        isSelected={selectedBlockId === child.id}
                        selectedBlockId={selectedBlockId}
                        testDataJson={testDataJson}
                        renderMode={renderMode}
                        onSelect={() => (onSelectBlockById ? onSelectBlockById(child.id) : onSelect())}
                        onSelectBlockById={onSelectBlockById}
                        onUpdateProps={(props) =>
                          onUpdateBlockPropsById ? onUpdateBlockPropsById(child.id, props) : onUpdateProps(props)
                        }
                        onUpdateBlockPropsById={onUpdateBlockPropsById}
                        onMoveUp={cIdx > 0 ? () => onMoveBlockById?.(child.id, 'up') : undefined}
                        onMoveDown={cIdx < elseChildren.length - 1 ? () => onMoveBlockById?.(child.id, 'down') : undefined}
                        onDuplicate={() => onDuplicateBlockById?.(child.id)}
                        onDelete={() => onDeleteBlockById?.(child.id)}
                        onMoveBlockById={onMoveBlockById}
                        onDuplicateBlockById={onDuplicateBlockById}
                        onDeleteBlockById={onDeleteBlockById}
                        onSelectParent={onSelect}
                        onAddBlockToContainer={onAddBlockToContainer}
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-zinc-400 italic bg-zinc-900/50 rounded-lg">
                  Condition is false and no Else branch is active. This section will not render in the email.
                </div>
              )}
            </div>
          );
        }

        // Raw / Editor Mode: Visual branches with drag-and-drop slots & quick add buttons
        return (
          <div className="rounded-xl border border-violet-500/50 bg-violet-950/15 p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-violet-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-violet-500/20 text-violet-300">
                  <GitFork className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-violet-200 uppercase tracking-wider">IF CONDITION</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-900/60 text-violet-300 border border-violet-700/50">
                  {"{{"}#if {cond}{"}}"}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded">
                Dynamic Component
              </span>
            </div>

            {/* THEN BRANCH CONTAINER */}
            <div className="rounded-lg border border-dashed border-violet-500/40 bg-zinc-950/40 p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-violet-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  THEN Branch (when true)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">
                    {thenChildren.length} {thenChildren.length === 1 ? 'component' : 'components'}
                  </span>
                  {onAddBlockToContainer && (
                    <QuickAddDropdown
                      label="Add to IF"
                      themeColor="violet"
                      onAdd={(type) =>
                        onAddBlockToContainer(
                          { type: 'if-branch', blockId: block.id, branch: 'then', index: thenChildren.length },
                          type
                        )
                      }
                    />
                  )}
                </div>
              </div>

              {thenChildren.length === 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDragOver({ type: 'if-branch', blockId: block.id, branch: 'then', index: 0 }, e);
                  }}
                  onDragLeave={(e) =>
                    handleDragLeave({ type: 'if-branch', blockId: block.id, branch: 'then', index: 0 }, e)
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDrop({ type: 'if-branch', blockId: block.id, branch: 'then', index: 0 }, e);
                  }}
                  className={`border border-dashed rounded-lg p-5 text-center text-xs transition-all ${
                    activeDropTarget?.type === 'if-branch' &&
                    activeDropTarget.blockId === block.id &&
                    activeDropTarget.branch === 'then' &&
                    activeDropTarget.index === 0
                      ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 scale-[1.01]'
                      : 'border-violet-500/30 text-violet-400/80 hover:border-violet-400 hover:text-violet-300'
                  }`}
                >
                  <Plus className="w-5 h-5 mx-auto mb-1 text-violet-400" />
                  <p className="font-semibold text-xs text-violet-200">Drop component here for THEN branch</p>
                  {onAddBlockToContainer && (
                    <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-zinc-400">or insert:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBlockToContainer(
                            { type: 'if-branch', blockId: block.id, branch: 'then', index: 0 },
                            'heading'
                          );
                        }}
                        className="px-2 py-0.5 rounded bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/30 text-[10px] cursor-pointer"
                      >
                        + Heading
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBlockToContainer(
                            { type: 'if-branch', blockId: block.id, branch: 'then', index: 0 },
                            'image'
                          );
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 text-[10px] cursor-pointer"
                      >
                        + Image
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBlockToContainer(
                            { type: 'if-branch', blockId: block.id, branch: 'then', index: 0 },
                            'text'
                          );
                        }}
                        className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/30 text-[10px] cursor-pointer"
                      >
                        + Text
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBlockToContainer(
                            { type: 'if-branch', blockId: block.id, branch: 'then', index: 0 },
                            'button'
                          );
                        }}
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-[10px] cursor-pointer"
                      >
                        + Button
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {thenChildren.map((child, cIdx) => (
                    <React.Fragment key={child.id}>
                      {renderSlotIndicator(
                        activeDropTarget?.type === 'if-branch' &&
                          activeDropTarget.blockId === block.id &&
                          activeDropTarget.branch === 'then' &&
                          activeDropTarget.index === cIdx
                      )}

                      <BlockRenderer
                        block={child}
                        columnId={columnId}
                        containerTarget={{ type: 'if-branch', blockId: block.id, branch: 'then' }}
                        index={cIdx}
                        columnWidthPx={columnWidthPx}
                        isSelected={selectedBlockId === child.id}
                        selectedBlockId={selectedBlockId}
                        testDataJson={testDataJson}
                        renderMode={renderMode}
                        onSelect={() => (onSelectBlockById ? onSelectBlockById(child.id) : onSelect())}
                        onSelectBlockById={onSelectBlockById}
                        onUpdateProps={(props) =>
                          onUpdateBlockPropsById ? onUpdateBlockPropsById(child.id, props) : onUpdateProps(props)
                        }
                        onUpdateBlockPropsById={onUpdateBlockPropsById}
                        onMoveUp={cIdx > 0 ? () => onMoveBlockById?.(child.id, 'up') : undefined}
                        onMoveDown={cIdx < thenChildren.length - 1 ? () => onMoveBlockById?.(child.id, 'down') : undefined}
                        onDuplicate={() => onDuplicateBlockById?.(child.id)}
                        onDelete={() => onDeleteBlockById?.(child.id)}
                        onMoveBlockById={onMoveBlockById}
                        onDuplicateBlockById={onDuplicateBlockById}
                        onDeleteBlockById={onDeleteBlockById}
                        onSelectParent={onSelect}
                        onAddBlockToContainer={onAddBlockToContainer}
                      />
                    </React.Fragment>
                  ))}

                  {renderSlotIndicator(
                    activeDropTarget?.type === 'if-branch' &&
                      activeDropTarget.blockId === block.id &&
                      activeDropTarget.branch === 'then' &&
                      activeDropTarget.index === thenChildren.length
                  )}

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDragOver(
                        { type: 'if-branch', blockId: block.id, branch: 'then', index: thenChildren.length },
                        e
                      );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDrop(
                        { type: 'if-branch', blockId: block.id, branch: 'then', index: thenChildren.length },
                        e
                      );
                    }}
                    className={`py-1.5 text-center text-[10px] rounded border border-dashed transition-all cursor-pointer ${
                      activeDropTarget?.type === 'if-branch' &&
                      activeDropTarget.blockId === block.id &&
                      activeDropTarget.branch === 'then' &&
                      activeDropTarget.index === thenChildren.length
                        ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                        : 'border-violet-500/20 text-zinc-400 hover:border-violet-500/40 hover:text-violet-300'
                    }`}
                  >
                    + Drop here to append to THEN branch
                  </div>
                </div>
              )}
            </div>

            {/* ELSE BRANCH CONTAINER */}
            {showElse && (
              <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/40 p-2.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    ELSE Branch (when false)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500">
                      {elseChildren.length} {elseChildren.length === 1 ? 'component' : 'components'}
                    </span>
                    {onAddBlockToContainer && (
                      <QuickAddDropdown
                        label="Add to ELSE"
                        themeColor="indigo"
                        onAdd={(type) =>
                          onAddBlockToContainer(
                            { type: 'if-branch', blockId: block.id, branch: 'else', index: elseChildren.length },
                            type
                          )
                        }
                      />
                    )}
                  </div>
                </div>

                {elseChildren.length === 0 ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDragOver({ type: 'if-branch', blockId: block.id, branch: 'else', index: 0 }, e);
                    }}
                    onDragLeave={(e) =>
                      handleDragLeave({ type: 'if-branch', blockId: block.id, branch: 'else', index: 0 }, e)
                    }
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDrop({ type: 'if-branch', blockId: block.id, branch: 'else', index: 0 }, e);
                    }}
                    className={`border border-dashed rounded-lg p-5 text-center text-xs transition-all ${
                      activeDropTarget?.type === 'if-branch' &&
                      activeDropTarget.blockId === block.id &&
                      activeDropTarget.branch === 'else' &&
                      activeDropTarget.index === 0
                        ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 scale-[1.01]'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Plus className="w-5 h-5 mx-auto mb-1 text-zinc-400" />
                    <p className="font-semibold text-xs text-zinc-300">Drop component here for ELSE branch</p>
                    {onAddBlockToContainer && (
                      <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-zinc-400">or insert:</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddBlockToContainer(
                              { type: 'if-branch', blockId: block.id, branch: 'else', index: 0 },
                              'heading'
                            );
                          }}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[10px] cursor-pointer"
                        >
                          + Heading
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddBlockToContainer(
                              { type: 'if-branch', blockId: block.id, branch: 'else', index: 0 },
                              'image'
                            );
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 text-[10px] cursor-pointer"
                        >
                          + Image
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddBlockToContainer(
                              { type: 'if-branch', blockId: block.id, branch: 'else', index: 0 },
                              'text'
                            );
                          }}
                          className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/30 text-[10px] cursor-pointer"
                        >
                          + Text
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddBlockToContainer(
                              { type: 'if-branch', blockId: block.id, branch: 'else', index: 0 },
                              'button'
                            );
                          }}
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-[10px] cursor-pointer"
                        >
                          + Button
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {elseChildren.map((child, cIdx) => (
                      <React.Fragment key={child.id}>
                        {renderSlotIndicator(
                          activeDropTarget?.type === 'if-branch' &&
                            activeDropTarget.blockId === block.id &&
                            activeDropTarget.branch === 'else' &&
                            activeDropTarget.index === cIdx
                        )}

                        <BlockRenderer
                          block={child}
                          columnId={columnId}
                          containerTarget={{ type: 'if-branch', blockId: block.id, branch: 'else' }}
                          index={cIdx}
                          columnWidthPx={columnWidthPx}
                          isSelected={selectedBlockId === child.id}
                          selectedBlockId={selectedBlockId}
                          testDataJson={testDataJson}
                          renderMode={renderMode}
                          onSelect={() => (onSelectBlockById ? onSelectBlockById(child.id) : onSelect())}
                          onSelectBlockById={onSelectBlockById}
                          onUpdateProps={(props) =>
                            onUpdateBlockPropsById ? onUpdateBlockPropsById(child.id, props) : onUpdateProps(props)
                          }
                          onUpdateBlockPropsById={onUpdateBlockPropsById}
                          onMoveUp={cIdx > 0 ? () => onMoveBlockById?.(child.id, 'up') : undefined}
                          onMoveDown={cIdx < elseChildren.length - 1 ? () => onMoveBlockById?.(child.id, 'down') : undefined}
                          onDuplicate={() => onDuplicateBlockById?.(child.id)}
                          onDelete={() => onDeleteBlockById?.(child.id)}
                          onMoveBlockById={onMoveBlockById}
                          onDuplicateBlockById={onDuplicateBlockById}
                          onDeleteBlockById={onDeleteBlockById}
                          onSelectParent={onSelect}
                          onAddBlockToContainer={onAddBlockToContainer}
                        />
                      </React.Fragment>
                    ))}

                    {renderSlotIndicator(
                      activeDropTarget?.type === 'if-branch' &&
                        activeDropTarget.blockId === block.id &&
                        activeDropTarget.branch === 'else' &&
                        activeDropTarget.index === elseChildren.length
                    )}

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDragOver(
                          { type: 'if-branch', blockId: block.id, branch: 'else', index: elseChildren.length },
                          e
                        );
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDrop(
                          { type: 'if-branch', blockId: block.id, branch: 'else', index: elseChildren.length },
                          e
                        );
                      }}
                      className={`py-1.5 text-center text-[10px] rounded border border-dashed transition-all cursor-pointer ${
                        activeDropTarget?.type === 'if-branch' &&
                        activeDropTarget.blockId === block.id &&
                        activeDropTarget.branch === 'else' &&
                        activeDropTarget.index === elseChildren.length
                          ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                          : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      + Drop here to append to ELSE branch
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      // Dynamic Component: Loop (Each)
      case 'loop': {
        const iter = block.props.iterable || 'order.items';
        const itemName = block.props.itemName || 'item';
        const children = block.children || [];

        // Evaluated preview mode
        if (renderMode === 'rendered') {
          const items = resolveIterable(iter, testDataJson);

          return (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/5 p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                  <Repeat className="w-4 h-4 text-emerald-400" />
                  <span>LOOP:</span>
                  <span className="font-mono bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-200">
                    {iter}
                  </span>
                  <span className="text-[10px] text-zinc-400">as |{itemName}|</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {items.length} {items.length === 1 ? 'item' : 'items'} rendered
                </span>
              </div>

              {items.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400 italic">
                  Array &quot;{iter}&quot; is empty in test payload. Add array data in the Properties panel to preview repeated items.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((itemVal, iIdx) => {
                    let scopedJson = testDataJson;
                    try {
                      const parsed = testDataJson ? JSON.parse(testDataJson) : {};
                      parsed[itemName] = itemVal;
                      parsed.this = itemVal;
                      scopedJson = JSON.stringify(parsed);
                    } catch {
                      // fallback
                    }

                    return (
                      <div
                        key={iIdx}
                        className="rounded-lg border border-emerald-500/20 bg-emerald-950/10 p-2 space-y-2 relative"
                      >
                        <span className="absolute top-1 right-2 text-[9px] font-mono text-emerald-500/60 uppercase">
                          Item #{iIdx + 1}
                        </span>
                        {children.map((child, cIdx) => (
                          <BlockRenderer
                            key={`${child.id}-iter-${iIdx}`}
                            block={child}
                            columnId={columnId}
                            containerTarget={{ type: 'loop', blockId: block.id }}
                            index={cIdx}
                            columnWidthPx={columnWidthPx}
                            isSelected={selectedBlockId === child.id}
                            selectedBlockId={selectedBlockId}
                            testDataJson={scopedJson}
                            renderMode={renderMode}
                            onSelect={() => (onSelectBlockById ? onSelectBlockById(child.id) : onSelect())}
                            onSelectBlockById={onSelectBlockById}
                            onUpdateProps={(props) =>
                              onUpdateBlockPropsById ? onUpdateBlockPropsById(child.id, props) : onUpdateProps(props)
                            }
                            onUpdateBlockPropsById={onUpdateBlockPropsById}
                            onMoveUp={cIdx > 0 ? () => onMoveBlockById?.(child.id, 'up') : undefined}
                            onMoveDown={cIdx < children.length - 1 ? () => onMoveBlockById?.(child.id, 'down') : undefined}
                            onDuplicate={() => onDuplicateBlockById?.(child.id)}
                            onDelete={() => onDeleteBlockById?.(child.id)}
                            onMoveBlockById={onMoveBlockById}
                            onDuplicateBlockById={onDuplicateBlockById}
                            onDeleteBlockById={onDeleteBlockById}
                            onSelectParent={onSelect}
                            onAddBlockToContainer={onAddBlockToContainer}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Raw / Editor Mode: Visual loop container with drop slots & quick add buttons
        return (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/15 p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-300">
                  <Repeat className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">LOOP COMPONENT</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  {"{{"}#each {iter} as |{itemName}|{"}}"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">
                  {children.length} {children.length === 1 ? 'component' : 'components'}
                </span>
                {onAddBlockToContainer && (
                  <QuickAddDropdown
                    label="Add to Loop"
                    themeColor="emerald"
                    onAdd={(type) =>
                      onAddBlockToContainer(
                        { type: 'loop', blockId: block.id, index: children.length },
                        type
                      )
                    }
                  />
                )}
              </div>
            </div>

            {/* Loop Children Container */}
            <div className="rounded-lg border border-dashed border-emerald-500/40 bg-zinc-950/40 p-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Repeated Template Blocks
                </span>
                <span className="text-[10px] text-zinc-500">
                  Loops over each item in {iter}
                </span>
              </div>

              {children.length === 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDragOver({ type: 'loop', blockId: block.id, index: 0 }, e);
                  }}
                  onDragLeave={(e) =>
                    handleDragLeave({ type: 'loop', blockId: block.id, index: 0 }, e)
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDrop({ type: 'loop', blockId: block.id, index: 0 }, e);
                  }}
                  className={`border border-dashed rounded-lg p-5 text-center text-xs transition-all ${
                    activeDropTarget?.type === 'loop' &&
                    activeDropTarget.blockId === block.id &&
                    activeDropTarget.index === 0
                      ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 scale-[1.01]'
                      : 'border-emerald-500/30 text-emerald-400/80 hover:border-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  <Plus className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <p className="font-semibold text-xs text-emerald-200">Drop component here to repeat in {iter}</p>
                  {onAddBlockToContainer && (
                    <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-zinc-400">or insert:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBlockToContainer({ type: 'loop', blockId: block.id, index: 0 }, 'heading');
                        }}
                        className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-[10px] cursor-pointer"
                      >
                        + Heading
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBlockToContainer({ type: 'loop', blockId: block.id, index: 0 }, 'image');
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 text-[10px] cursor-pointer"
                      >
                        + Image
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBlockToContainer({ type: 'loop', blockId: block.id, index: 0 }, 'text');
                        }}
                        className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/30 text-[10px] cursor-pointer"
                      >
                        + Text
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBlockToContainer({ type: 'loop', blockId: block.id, index: 0 }, 'button');
                        }}
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-[10px] cursor-pointer"
                      >
                        + Button
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {children.map((child, cIdx) => (
                    <React.Fragment key={child.id}>
                      {renderSlotIndicator(
                        activeDropTarget?.type === 'loop' &&
                          activeDropTarget.blockId === block.id &&
                          activeDropTarget.index === cIdx
                      )}

                      <BlockRenderer
                        block={child}
                        columnId={columnId}
                        containerTarget={{ type: 'loop', blockId: block.id }}
                        index={cIdx}
                        columnWidthPx={columnWidthPx}
                        isSelected={selectedBlockId === child.id}
                        selectedBlockId={selectedBlockId}
                        testDataJson={testDataJson}
                        renderMode={renderMode}
                        onSelect={() => (onSelectBlockById ? onSelectBlockById(child.id) : onSelect())}
                        onSelectBlockById={onSelectBlockById}
                        onUpdateProps={(props) =>
                          onUpdateBlockPropsById ? onUpdateBlockPropsById(child.id, props) : onUpdateProps(props)
                        }
                        onUpdateBlockPropsById={onUpdateBlockPropsById}
                        onMoveUp={cIdx > 0 ? () => onMoveBlockById?.(child.id, 'up') : undefined}
                        onMoveDown={cIdx < children.length - 1 ? () => onMoveBlockById?.(child.id, 'down') : undefined}
                        onDuplicate={() => onDuplicateBlockById?.(child.id)}
                        onDelete={() => onDeleteBlockById?.(child.id)}
                        onMoveBlockById={onMoveBlockById}
                        onDuplicateBlockById={onDuplicateBlockById}
                        onDeleteBlockById={onDeleteBlockById}
                        onSelectParent={onSelect}
                        onAddBlockToContainer={onAddBlockToContainer}
                      />
                    </React.Fragment>
                  ))}

                  {renderSlotIndicator(
                    activeDropTarget?.type === 'loop' &&
                      activeDropTarget.blockId === block.id &&
                      activeDropTarget.index === children.length
                  )}

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDragOver(
                        { type: 'loop', blockId: block.id, index: children.length },
                        e
                      );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDrop(
                        { type: 'loop', blockId: block.id, index: children.length },
                        e
                      );
                    }}
                    className={`py-1.5 text-center text-[10px] rounded border border-dashed transition-all cursor-pointer ${
                      activeDropTarget?.type === 'loop' &&
                      activeDropTarget.blockId === block.id &&
                      activeDropTarget.index === children.length
                        ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                        : 'border-emerald-500/20 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-300'
                    }`}
                  >
                    + Drop here to append to loop
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStartBlock}
      onDragEnd={endDrag}
      onDragOver={isDynamicContainer ? undefined : handleDragOverBlock}
      onDrop={isDynamicContainer ? undefined : handleDropOnBlock}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group p-2 rounded-lg transition-all cursor-pointer select-none ${
        isThisBlockDragging
          ? 'opacity-40 border-2 border-dashed border-indigo-500 scale-[0.98]'
          : isSelected
          ? 'ring-2 ring-indigo-500 bg-indigo-500/5'
          : 'hover:ring-1 hover:ring-indigo-400/50 hover:bg-zinc-50/50'
      }`}
    >
      {/* Visual Hover Drag Grip */}
      <div
        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-zinc-800/80 text-zinc-400 hover:text-white cursor-grab active:cursor-grabbing z-20 pointer-events-none"
        title="Drag block to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Quick Hover Delete Button */}
      {!isSelected && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-zinc-900/90 border border-zinc-700/80 text-zinc-400 hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-950/40 z-20 shadow-xs cursor-pointer"
          title="Delete Block"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {isSelected && (
        <BlockToolbar
          label={block.type === 'if-else' ? 'If / Else' : block.type === 'loop' ? 'Loop (Each)' : block.type}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onSelectParent={onSelectParent}
          onDragStartHandle={handleDragStartBlock}
        />
      )}
      {renderContent()}
    </div>
  );
}
