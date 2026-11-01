'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { DragItem, DropTarget } from '../model/types';

export interface BuilderDndContextValue {
  activeDragItem: DragItem | null;
  activeDropTarget: DropTarget | null;
  startDrag: (item: DragItem, e: React.DragEvent) => void;
  endDrag: () => void;
  handleDragOver: (target: DropTarget, e: React.DragEvent) => void;
  handleDragLeave: (target: DropTarget, e: React.DragEvent) => void;
  handleDrop: (target: DropTarget, e: React.DragEvent) => void;
  isDragging: boolean;
}

const BuilderDndContext = createContext<BuilderDndContextValue | null>(null);

export interface BuilderDndProviderProps {
  children: React.ReactNode;
  onDropItem: (item: DragItem, target: DropTarget) => void;
}

export function BuilderDndProvider({ children, onDropItem }: BuilderDndProviderProps) {
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<DropTarget | null>(null);
  const dragItemRef = useRef<DragItem | null>(null);

  const startDrag = useCallback((item: DragItem, e: React.DragEvent) => {
    e.stopPropagation();
    setActiveDragItem(item);
    dragItemRef.current = item;

    try {
      e.dataTransfer.setData('text/plain', JSON.stringify(item));
      e.dataTransfer.effectAllowed = item.kind.startsWith('new-') ? 'copy' : 'move';
    } catch {
      // Fallback if dataTransfer is restricted
    }
  }, []);

  const endDrag = useCallback(() => {
    setActiveDragItem(null);
    setActiveDropTarget(null);
    dragItemRef.current = null;
  }, []);

  const handleDragOver = useCallback((target: DropTarget, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.dataTransfer.dropEffect = dragItemRef.current?.kind.startsWith('new-') ? 'copy' : 'move';
    } catch {
      // Ignore
    }

    setActiveDropTarget((prev) => {
      if (
        prev &&
        prev.type === target.type &&
        prev.index === target.index &&
        (prev.type === 'column' && target.type === 'column' ? prev.columnId === target.columnId : true) &&
        (prev.type === 'section' && target.type === 'section' ? prev.sectionId === target.sectionId : true)
      ) {
        return prev;
      }
      return target;
    });
  }, []);

  const handleDragLeave = useCallback((target: DropTarget, e: React.DragEvent) => {
    e.stopPropagation();
    setActiveDropTarget((prev) => {
      if (!prev) return null;
      if (prev.type === target.type && prev.index === target.index) {
        if (prev.type === 'column' && target.type === 'column' && prev.columnId === target.columnId) {
          return null;
        }
        if (prev.type === 'section' && target.type === 'section' && prev.sectionId === target.sectionId) {
          return null;
        }
        if (prev.type === 'document') {
          return null;
        }
      }
      return prev;
    });
  }, []);

  const handleDrop = useCallback(
    (target: DropTarget, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      let item = dragItemRef.current || activeDragItem;
      if (!item) {
        try {
          const raw = e.dataTransfer.getData('text/plain');
          if (raw) {
            item = JSON.parse(raw);
          }
        } catch {
          // Ignore parse errors
        }
      }

      if (item) {
        onDropItem(item, target);
      }

      endDrag();
    },
    [activeDragItem, endDrag, onDropItem]
  );

  return (
    <BuilderDndContext.Provider
      value={{
        activeDragItem,
        activeDropTarget,
        startDrag,
        endDrag,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        isDragging: activeDragItem !== null,
      }}
    >
      {children}
    </BuilderDndContext.Provider>
  );
}

export function useBuilderDnd() {
  const context = useContext(BuilderDndContext);
  if (!context) {
    throw new Error('useBuilderDnd must be used within a BuilderDndProvider');
  }
  return context;
}
