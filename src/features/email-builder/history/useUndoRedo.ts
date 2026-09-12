import { useCallback, useEffect, useState } from 'react';
import { BuilderDocument } from '../model/types';

const MAX_HISTORY = 50;

export function useUndoRedo(initialDoc: BuilderDocument) {
  const [doc, setDocState] = useState<BuilderDocument>(initialDoc);
  const [past, setPast] = useState<BuilderDocument[]>([]);
  const [future, setFuture] = useState<BuilderDocument[]>([]);

  // Update current document, recording history
  const setDoc = useCallback((nextDoc: BuilderDocument | ((prev: BuilderDocument) => BuilderDocument), recordHistory = true) => {
    setDocState((prevDoc) => {
      const resolved = typeof nextDoc === 'function' ? nextDoc(prevDoc) : nextDoc;
      if (recordHistory && JSON.stringify(resolved) !== JSON.stringify(prevDoc)) {
        setPast((prevPast) => [...prevPast.slice(-MAX_HISTORY + 1), prevDoc]);
        setFuture([]);
      }
      return resolved;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setDocState((currentDoc) => {
        setFuture((prevFuture) => [currentDoc, ...prevFuture]);
        return previous;
      });

      return newPast;
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setDocState((currentDoc) => {
        setPast((prevPast) => [...prevPast, currentDoc]);
        return next;
      });

      return newFuture;
    });
  }, []);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    doc,
    setDoc,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
