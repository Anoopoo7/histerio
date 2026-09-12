import { useCallback, useRef, useState } from 'react';
import { DragItem, DropTarget } from '../model/types';

export interface PointerDragState {
  isDragging: boolean;
  item: DragItem | null;
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
  dropTarget: DropTarget | null;
}

export function usePointerDrag() {
  const [dragState, setDragState] = useState<PointerDragState>({
    isDragging: false,
    item: null,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    dropTarget: null,
  });

  const activePointerIdRef = useRef<number | null>(null);

  const startDrag = useCallback((item: DragItem, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    activePointerIdRef.current = e.pointerId;
    if (e.currentTarget && 'setPointerCapture' in e.currentTarget) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
    }

    setDragState({
      isDragging: true,
      item,
      startPos: { x: e.clientX, y: e.clientY },
      currentPos: { x: e.clientX, y: e.clientY },
      dropTarget: null,
    });
  }, []);

  const updateDrag = useCallback((x: number, y: number, dropTarget: DropTarget | null = null) => {
    setDragState((prev) => {
      if (!prev.isDragging) return prev;
      return {
        ...prev,
        currentPos: { x, y },
        dropTarget: dropTarget || prev.dropTarget,
      };
    });
  }, []);

  const updateDropTarget = useCallback((dropTarget: DropTarget | null) => {
    setDragState((prev) => ({ ...prev, dropTarget }));
  }, []);

  const stopDrag = useCallback(() => {
    setDragState((prev) => ({
      ...prev,
      isDragging: false,
    }));
  }, []);

  const resetDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      item: null,
      startPos: { x: 0, y: 0 },
      currentPos: { x: 0, y: 0 },
      dropTarget: null,
    });
  }, []);

  return {
    dragState,
    startDrag,
    updateDrag,
    updateDropTarget,
    stopDrag,
    resetDrag,
  };
}
