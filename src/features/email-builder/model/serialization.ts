import { createDefaultDocument } from './defaults';
import { BuilderBlock, BuilderDocument } from './types';
import { validateBuilderDocument } from './validation';

export function serializeBuilder(doc: BuilderDocument): Record<string, unknown> {
  const cloned = JSON.parse(JSON.stringify(doc)) as BuilderDocument;

  for (const s of cloned.children || []) {
    for (const r of s.children || []) {
      for (const c of r.columns || []) {
        if (Array.isArray(c.children)) {
          // Flatten block props to avoid 5th-level JSON nesting
          c.children = c.children.map((b) => {
            if (b && typeof b === 'object' && 'props' in b && b.props && typeof b.props === 'object') {
              const { props, ...rest } = b;
              return { ...rest, ...(props as unknown as Record<string, unknown>) } as unknown as BuilderBlock;
            }
            return b;
          });
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
            c.children = c.children.map((rawBlock) => {
              const b = rawBlock as unknown as Record<string, unknown>;
              if (!b || typeof b !== 'object') return rawBlock;

              if ('props' in b && b.props && typeof b.props === 'object') {
                return b as unknown as BuilderBlock;
              }

              // Extract flat keys into props
              const { id, type, ...rest } = b;
              return {
                id: String(id || ''),
                type: String(type || 'text'),
                props: rest,
              } as unknown as BuilderBlock;
            });
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
