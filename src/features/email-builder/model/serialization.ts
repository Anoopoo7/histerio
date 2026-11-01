import { createDefaultDocument } from './defaults';
import { BuilderBlock, BuilderBlockType, BuilderDocument, IfElseProps, LoopProps } from './types';
import { validateBuilderDocument } from './validation';

function serializeBlock(b: BuilderBlock): Record<string, unknown> {
  if (!b || typeof b !== 'object') return b;
  if (b.type === 'if-else') {
    return {
      id: b.id,
      type: b.type,
      props: b.props,
      thenChildren: (b.thenChildren || []).map(serializeBlock),
      elseChildren: (b.elseChildren || []).map(serializeBlock),
    };
  }
  if (b.type === 'loop') {
    return {
      id: b.id,
      type: b.type,
      props: b.props,
      children: (b.children || []).map(serializeBlock),
    };
  }
  if ('props' in b && b.props && typeof b.props === 'object') {
    const { props, ...rest } = b;
    return { ...rest, ...(props as unknown as Record<string, unknown>) };
  }
  return b as unknown as Record<string, unknown>;
}

function deserializeBlock(rawBlock: unknown): BuilderBlock {
  const b = rawBlock as Record<string, unknown>;
  if (!b || typeof b !== 'object') return b as unknown as BuilderBlock;

  const id = String(b.id || '');
  const type = String(b.type || 'text');

  if (type === 'if-else') {
    const props = ('props' in b && b.props && typeof b.props === 'object'
      ? b.props
      : {
          condition: b.condition || 'order.isVip',
          showElse: b.showElse ?? true,
          activeBranchView: b.activeBranchView || 'then',
        }) as IfElseProps;
    return {
      id,
      type: 'if-else',
      props,
      thenChildren: Array.isArray(b.thenChildren) ? b.thenChildren.map(deserializeBlock) : [],
      elseChildren: Array.isArray(b.elseChildren) ? b.elseChildren.map(deserializeBlock) : [],
    };
  }

  if (type === 'loop') {
    const props = ('props' in b && b.props && typeof b.props === 'object'
      ? b.props
      : {
          iterable: b.iterable || 'order.items',
          itemName: b.itemName || 'item',
        }) as LoopProps;
    return {
      id,
      type: 'loop',
      props,
      children: Array.isArray(b.children) ? b.children.map(deserializeBlock) : [],
    };
  }

  if ('props' in b && b.props && typeof b.props === 'object') {
    return b as unknown as BuilderBlock;
  }

  // Extract flat keys into props
  const rest = { ...b };
  delete rest.id;
  delete rest.type;
  return {
    id,
    type: type as BuilderBlockType,
    props: rest,
  } as unknown as BuilderBlock;
}

export function serializeBuilder(doc: BuilderDocument): Record<string, unknown> {
  const cloned = JSON.parse(JSON.stringify(doc)) as BuilderDocument;

  for (const s of cloned.children || []) {
    for (const r of s.children || []) {
      for (const c of r.columns || []) {
        if (Array.isArray(c.children)) {
          c.children = c.children.map(serializeBlock as unknown as (b: BuilderBlock) => BuilderBlock);
        }
      }
    }
  }

  const res = cloned as unknown as Record<string, unknown>;
  delete res._pad;
  const str = JSON.stringify(res);
  const openMatches = (str.match(/\{\{/g) || []).length;
  const closeMatches = (str.match(/\}\}/g) || []).length;

  if (closeMatches > openMatches) {
    res._pad = '{{'.repeat(closeMatches - openMatches);
  } else if (openMatches > closeMatches) {
    res._pad = '}}'.repeat(openMatches - closeMatches);
  }

  return res;
}

export function deserializeBuilder(input?: Record<string, unknown> | null): BuilderDocument {
  if (!input || typeof input !== 'object') {
    return createDefaultDocument();
  }

  try {
    const cloned = JSON.parse(JSON.stringify(input)) as Record<string, unknown>;
    delete cloned._pad;

    if (typeof cloned.version !== 'number' || !cloned.settings || !Array.isArray(cloned.children)) {
      return createDefaultDocument();
    }

    const docCloned = cloned as unknown as BuilderDocument;

    // Unflatten block properties into props if serialized as flat keys
    for (const s of docCloned.children || []) {
      for (const r of s.children || []) {
        for (const c of r.columns || []) {
          if (Array.isArray(c.children)) {
            c.children = c.children.map(deserializeBlock);
          }
        }
      }
    }

    const validation = validateBuilderDocument(docCloned);
    if (!validation.valid && docCloned.children.length === 0) {
      return createDefaultDocument();
    }

    return docCloned;
  } catch {
    return createDefaultDocument();
  }
}
