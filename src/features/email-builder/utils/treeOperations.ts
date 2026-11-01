import { generateId } from '../model/defaults';
import { BuilderBlock, BuilderDocument, DropTarget } from '../model/types';

export function cloneBlockWithNewIds(block: BuilderBlock): BuilderBlock {
  const newId = generateId(`block-${block.type}`);
  if (block.type === 'if-else') {
    return {
      ...block,
      id: newId,
      props: { ...block.props },
      thenChildren: (block.thenChildren || []).map(cloneBlockWithNewIds),
      elseChildren: (block.elseChildren || []).map(cloneBlockWithNewIds),
    };
  }
  if (block.type === 'loop') {
    return {
      ...block,
      id: newId,
      props: { ...block.props },
      children: (block.children || []).map(cloneBlockWithNewIds),
    };
  }
  const cloned = JSON.parse(JSON.stringify(block)) as BuilderBlock;
  cloned.id = newId;
  return cloned;
}

export function findBlockRecursive(blocks: BuilderBlock[], id: string): BuilderBlock | null {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.type === 'if-else') {
      const inThen = findBlockRecursive(b.thenChildren || [], id);
      if (inThen) return inThen;
      const inElse = findBlockRecursive(b.elseChildren || [], id);
      if (inElse) return inElse;
    } else if (b.type === 'loop') {
      const inChildren = findBlockRecursive(b.children || [], id);
      if (inChildren) return inChildren;
    }
  }
  return null;
}

export function findBlockInDoc(doc: BuilderDocument, blockId: string): BuilderBlock | null {
  for (const s of doc.children || []) {
    for (const r of s.children || []) {
      for (const c of r.columns || []) {
        const found = findBlockRecursive(c.children || [], blockId);
        if (found) return found;
      }
    }
  }
  return null;
}

export function removeBlockFromList(
  blocks: BuilderBlock[],
  blockId: string
): { updated: BuilderBlock[]; removed: BuilderBlock | null } {
  const idx = blocks.findIndex((b) => b.id === blockId);
  if (idx !== -1) {
    const updated = [...blocks];
    const [removed] = updated.splice(idx, 1);
    return { updated, removed };
  }

  let removedBlock: BuilderBlock | null = null;
  const updated = blocks.map((b) => {
    if (b.type === 'if-else') {
      const resThen = removeBlockFromList(b.thenChildren || [], blockId);
      if (resThen.removed) {
        removedBlock = resThen.removed;
        return { ...b, thenChildren: resThen.updated };
      }
      const resElse = removeBlockFromList(b.elseChildren || [], blockId);
      if (resElse.removed) {
        removedBlock = resElse.removed;
        return { ...b, elseChildren: resElse.updated };
      }
    } else if (b.type === 'loop') {
      const resChildren = removeBlockFromList(b.children || [], blockId);
      if (resChildren.removed) {
        removedBlock = resChildren.removed;
        return { ...b, children: resChildren.updated };
      }
    }
    return b;
  });

  return { updated, removed: removedBlock };
}

export function removeBlockFromDoc(
  doc: BuilderDocument,
  blockId: string
): { doc: BuilderDocument; removed: BuilderBlock | null } {
  let removedBlock: BuilderBlock | null = null;

  const nextDoc: BuilderDocument = {
    ...doc,
    children: doc.children.map((s) => ({
      ...s,
      children: s.children.map((r) => ({
        ...r,
        columns: r.columns.map((c) => {
          const res = removeBlockFromList(c.children || [], blockId);
          if (res.removed) {
            removedBlock = res.removed;
            return { ...c, children: res.updated };
          }
          return c;
        }),
      })),
    })),
  };

  return { doc: nextDoc, removed: removedBlock };
}

export function insertBlockIntoList(
  blocks: BuilderBlock[],
  target: DropTarget,
  newBlock: BuilderBlock
): { updated: BuilderBlock[]; inserted: boolean } {
  let inserted = false;

  const updated = blocks.map((b) => {
    if (b.type === 'if-else') {
      if (target.type === 'if-branch' && target.blockId === b.id) {
        inserted = true;
        if (target.branch === 'then') {
          const list = [...(b.thenChildren || [])];
          const insertIdx = Math.max(0, Math.min(target.index, list.length));
          list.splice(insertIdx, 0, newBlock);
          return { ...b, thenChildren: list };
        } else {
          const list = [...(b.elseChildren || [])];
          const insertIdx = Math.max(0, Math.min(target.index, list.length));
          list.splice(insertIdx, 0, newBlock);
          return { ...b, elseChildren: list };
        }
      }

      // Check nested
      const inThen = insertBlockIntoList(b.thenChildren || [], target, newBlock);
      if (inThen.inserted) {
        inserted = true;
        return { ...b, thenChildren: inThen.updated };
      }
      const inElse = insertBlockIntoList(b.elseChildren || [], target, newBlock);
      if (inElse.inserted) {
        inserted = true;
        return { ...b, elseChildren: inElse.updated };
      }
    } else if (b.type === 'loop') {
      if (target.type === 'loop' && target.blockId === b.id) {
        inserted = true;
        const list = [...(b.children || [])];
        const insertIdx = Math.max(0, Math.min(target.index, list.length));
        list.splice(insertIdx, 0, newBlock);
        return { ...b, children: list };
      }

      // Check nested
      const inChildren = insertBlockIntoList(b.children || [], target, newBlock);
      if (inChildren.inserted) {
        inserted = true;
        return { ...b, children: inChildren.updated };
      }
    }
    return b;
  });

  return { updated, inserted };
}

export function insertBlockIntoDoc(
  doc: BuilderDocument,
  target: DropTarget,
  newBlock: BuilderBlock
): BuilderDocument {
  if (target.type === 'column') {
    return {
      ...doc,
      children: doc.children.map((s) => ({
        ...s,
        children: s.children.map((r) => ({
          ...r,
          columns: r.columns.map((c) => {
            if (c.id !== target.columnId) return c;
            const newChildren = [...c.children];
            const insertIdx = Math.max(0, Math.min(target.index, newChildren.length));
            newChildren.splice(insertIdx, 0, newBlock);
            return { ...c, children: newChildren };
          }),
        })),
      })),
    };
  }

  if (target.type === 'if-branch' || target.type === 'loop') {
    return {
      ...doc,
      children: doc.children.map((s) => ({
        ...s,
        children: s.children.map((r) => ({
          ...r,
          columns: r.columns.map((c) => {
            const res = insertBlockIntoList(c.children, target, newBlock);
            return res.inserted ? { ...c, children: res.updated } : c;
          }),
        })),
      })),
    };
  }

  return doc;
}

export function insertBlockNextTo(
  doc: BuilderDocument,
  targetBlockId: string,
  newBlock: BuilderBlock
): { doc: BuilderDocument; inserted: boolean } {
  let inserted = false;

  function insertInBlockList(blocks: BuilderBlock[]): BuilderBlock[] {
    const idx = blocks.findIndex((b) => b.id === targetBlockId);
    if (idx !== -1) {
      inserted = true;
      const target = blocks[idx];
      // If the target block is an if-else container, insert into its thenChildren
      if (target.type === 'if-else') {
        const list = [...(target.thenChildren || [])];
        list.push(newBlock);
        return blocks.map((b, i) => (i === idx ? { ...b, thenChildren: list } : b));
      }
      // If the target block is a loop container, insert into its children
      if (target.type === 'loop') {
        const list = [...(target.children || [])];
        list.push(newBlock);
        return blocks.map((b, i) => (i === idx ? { ...b, children: list } : b));
      }
      // Otherwise insert immediately after this block
      const list = [...blocks];
      list.splice(idx + 1, 0, newBlock);
      return list;
    }

    return blocks.map((b) => {
      if (b.type === 'if-else') {
        const nextThen = insertInBlockList(b.thenChildren || []);
        if (inserted) return { ...b, thenChildren: nextThen };
        const nextElse = insertInBlockList(b.elseChildren || []);
        if (inserted) return { ...b, elseChildren: nextElse };
      } else if (b.type === 'loop') {
        const nextChildren = insertInBlockList(b.children || []);
        if (inserted) return { ...b, children: nextChildren };
      }
      return b;
    });
  }

  const nextDoc: BuilderDocument = {
    ...doc,
    children: doc.children.map((s) => ({
      ...s,
      children: s.children.map((r) => ({
        ...r,
        columns: r.columns.map((c) => {
          if (inserted) return c;
          const nextChildren = insertInBlockList(c.children);
          return { ...c, children: nextChildren };
        }),
      })),
    })),
  };

  return { doc: nextDoc, inserted };
}

export function updateBlockPropsRecursive(
  blocks: BuilderBlock[],
  blockId: string,
  props: Record<string, unknown>
): BuilderBlock[] {
  return blocks.map((b) => {
    if (b.id === blockId) {
      return { ...b, props: { ...b.props, ...props } } as BuilderBlock;
    }
    if (b.type === 'if-else') {
      return {
        ...b,
        thenChildren: updateBlockPropsRecursive(b.thenChildren || [], blockId, props),
        elseChildren: updateBlockPropsRecursive(b.elseChildren || [], blockId, props),
      };
    }
    if (b.type === 'loop') {
      return {
        ...b,
        children: updateBlockPropsRecursive(b.children || [], blockId, props),
      };
    }
    return b;
  });
}

export function moveBlockRecursive(
  blocks: BuilderBlock[],
  blockId: string,
  direction: 'up' | 'down'
): BuilderBlock[] {
  const idx = blocks.findIndex((b) => b.id === blockId);
  if (idx !== -1) {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return blocks;
    const updated = [...blocks];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    return updated;
  }

  return blocks.map((b) => {
    if (b.type === 'if-else') {
      return {
        ...b,
        thenChildren: moveBlockRecursive(b.thenChildren || [], blockId, direction),
        elseChildren: moveBlockRecursive(b.elseChildren || [], blockId, direction),
      };
    }
    if (b.type === 'loop') {
      return {
        ...b,
        children: moveBlockRecursive(b.children || [], blockId, direction),
      };
    }
    return b;
  });
}

export function duplicateBlockRecursive(blocks: BuilderBlock[], blockId: string): BuilderBlock[] {
  const idx = blocks.findIndex((b) => b.id === blockId);
  if (idx !== -1) {
    const original = blocks[idx];
    const clone = cloneBlockWithNewIds(original);
    const updated = [...blocks];
    updated.splice(idx + 1, 0, clone);
    return updated;
  }

  return blocks.map((b) => {
    if (b.type === 'if-else') {
      return {
        ...b,
        thenChildren: duplicateBlockRecursive(b.thenChildren || [], blockId),
        elseChildren: duplicateBlockRecursive(b.elseChildren || [], blockId),
      };
    }
    if (b.type === 'loop') {
      return {
        ...b,
        children: duplicateBlockRecursive(b.children || [], blockId),
      };
    }
    return b;
  });
}

export function deleteBlockRecursive(blocks: BuilderBlock[], blockId: string): BuilderBlock[] {
  const filtered = blocks.filter((b) => b.id !== blockId);
  return filtered.map((b) => {
    if (b.type === 'if-else') {
      return {
        ...b,
        thenChildren: deleteBlockRecursive(b.thenChildren || [], blockId),
        elseChildren: deleteBlockRecursive(b.elseChildren || [], blockId),
      };
    }
    if (b.type === 'loop') {
      return {
        ...b,
        children: deleteBlockRecursive(b.children || [], blockId),
      };
    }
    return b;
  });
}
