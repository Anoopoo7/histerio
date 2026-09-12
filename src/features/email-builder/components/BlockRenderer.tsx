'use client';

import React, { useRef } from 'react';
import {
  BuilderBlock,
  ButtonProps,
  DividerProps,
  FooterProps,
  HeadingProps,
  ImageProps,
  LogoProps,
  SocialProps,
  SpacerProps,
  TextProps,
} from '../model/types';
import { BlockToolbar } from './BlockToolbar';
import { replaceVariablesWithMockData } from '../utils/variableUtils';

export interface BlockRendererProps {
  block: BuilderBlock;
  columnWidthPx: number;
  isSelected: boolean;
  testDataJson?: string;
  renderMode?: 'raw' | 'rendered';
  onSelect: () => void;
  onUpdateProps: (props: Record<string, unknown>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSelectParent?: () => void;
}

export function BlockRenderer({
  block,
  columnWidthPx,
  isSelected,
  testDataJson,
  renderMode = 'raw',
  onSelect,
  onUpdateProps,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onSelectParent,
}: BlockRendererProps) {
  const isResizingImageRef = useRef(false);

  const evalText = (rawStr: string | undefined | null) => {
    if (!rawStr) return '';
    if (renderMode === 'rendered' && testDataJson) {
      return replaceVariablesWithMockData(rawStr, testDataJson);
    }
    return rawStr;
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

      // Constraints: min 40px, max columnWidthPx
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
              {/* eslint-disable-next-html-element-cap */}
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
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group p-2 rounded-lg transition-all cursor-pointer ${
        isSelected
          ? 'ring-2 ring-indigo-500 bg-indigo-500/5'
          : 'hover:ring-1 hover:ring-indigo-400/50 hover:bg-zinc-50/50'
      }`}
    >
      {isSelected && (
        <BlockToolbar
          label={block.type}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onSelectParent={onSelectParent}
        />
      )}
      {renderContent()}
    </div>
  );
}
