import { BuilderBlock, BuilderDocument } from '../model/types';

export interface VariableOption {
  path: string;
  label: string;
  category: 'Customer' | 'Order' | 'Item' | 'Company' | 'System';
}

export const COMMON_VARIABLES: VariableOption[] = [
  { path: 'customer.name', label: 'Customer Name', category: 'Customer' },
  { path: 'customer.email', label: 'Customer Email', category: 'Customer' },
  { path: 'customer.phone', label: 'Customer Phone', category: 'Customer' },
  { path: 'order.id', label: 'Order ID', category: 'Order' },
  { path: 'order.date', label: 'Order Date', category: 'Order' },
  { path: 'order.status', label: 'Order Status', category: 'Order' },
  { path: 'order.subtotal', label: 'Subtotal Amount', category: 'Order' },
  { path: 'order.tax', label: 'Tax Amount', category: 'Order' },
  { path: 'order.shipping', label: 'Shipping Cost', category: 'Order' },
  { path: 'order.total', label: 'Grand Total', category: 'Order' },
  { path: 'order.items', label: 'Order Items Array (Loop)', category: 'Item' },
  { path: 'item.name', label: 'Item Name', category: 'Item' },
  { path: 'item.price', label: 'Item Price', category: 'Item' },
  { path: 'item.quantity', label: 'Item Quantity', category: 'Item' },
  { path: 'item.sku', label: 'Item SKU', category: 'Item' },
  { path: 'item.image', label: 'Item Image URL', category: 'Item' },
  { path: 'item.total', label: 'Item Total Amount', category: 'Item' },
  { path: 'company.name', label: 'Company Name', category: 'Company' },
  { path: 'company.support_email', label: 'Support Email', category: 'Company' },
  { path: 'company.unsubscribe_url', label: 'Unsubscribe Link', category: 'Company' },
];

export function getPathsFromObject(obj: unknown, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return [];
  const paths: string[] = [];
  const record = obj as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const val = record[key];

    if (Array.isArray(val)) {
      paths.push(fullPath);
      if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
        const itemPaths = getPathsFromObject(val[0], 'this');
        paths.push(...itemPaths);
      }
    } else if (val && typeof val === 'object' && val !== null) {
      paths.push(...getPathsFromObject(val, fullPath));
    } else {
      paths.push(fullPath);
    }
  }

  return Array.from(new Set(paths));
}

export const DEFAULT_MOCK_DATA_JSON = JSON.stringify(
  {
    order: {
      id: '1234',
      name: 'Jane Doe',
      isVip: true,
      items: [
        { name: 'Wireless Headphones', quantity: 1, price: '$199.99' },
      ],
      total: '$199.99',
    },
    customer: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      isVip: true,
    },
  },
  null,
  2
);

export function isValidVariablePath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  const trimmed = path.trim();
  // Valid Handlebars path: letters, numbers, underscores, dots, #, /
  return /^[#\/]?[a-zA-Z0-9_.]+(\.[a-zA-Z0-9_.]+)*$/.test(trimmed);
}

export function validateVariableSyntax(text: string | undefined | null): string | null {
  if (!text || typeof text !== 'string') return null;

  // 1. Check for unmatched {{ without }}
  const doubleOpenRegex = /\{\{(?![^{}]*\}\})/g;
  const matchOpen = doubleOpenRegex.exec(text);
  if (matchOpen) {
    const snippet = text.slice(Math.max(0, matchOpen.index - 10), Math.min(text.length, matchOpen.index + 30));
    return `Unmatched opening variable bracket '{{' near '${snippet}'`;
  }

  // 2. Check for unmatched }} without {{
  const parts = text.split('}}');
  let openDepth = 0;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const opens = (p.match(/\{\{/g) || []).length;
    openDepth += opens - 1;
    if (openDepth < 0) {
      const snippet = (p.slice(-20) + '}}').trim();
      return `Unmatched closing variable bracket '}}' near '${snippet}'`;
    }
  }

  // 3. Check for single-bracket variable attempts like {customer.name}
  const singleBracketRegex = /(^|[^{])\{([a-zA-Z0-9_.]+)\}(?!})/g;
  const matchSingle = singleBracketRegex.exec(text);
  if (matchSingle) {
    return `Malformed variable '${matchSingle[0].trim()}' - Handlebars variables require double braces like '{{${matchSingle[2]}}}'`;
  }

  return null;
}

export function extractVariables(text: string): string[] {
  if (!text) return [];
  const regex = /\{\{\s*([#\/]?[a-zA-Z0-9_.]+)\s*\}\}/g;
  const set = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && !match[1].startsWith('#') && !match[1].startsWith('/')) {
      set.add(match[1]);
    }
  }
  return Array.from(set);
}

export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object' || !path) return undefined;
  const parts = path.split('.');
  let curr: unknown = obj;
  for (const p of parts) {
    if (curr && typeof curr === 'object' && p in (curr as Record<string, unknown>)) {
      curr = (curr as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return curr;
}

export function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!curr[p] || typeof curr[p] !== 'object' || Array.isArray(curr[p])) {
      curr[p] = {};
    }
    curr = curr[p] as Record<string, unknown>;
  }
  const lastKey = parts[parts.length - 1];
  curr[lastKey] = value;
}

export function hasNestedValue(obj: unknown, path: string): boolean {
  return getNestedValue(obj, path) !== undefined;
}

export function generateSampleValue(path: string): unknown {
  const clean = path.toLowerCase().replace(/[^a-z0-9_.]/g, '');
  const lastPart = clean.split('.').pop() || clean;

  if (lastPart === 'sample') return 'sample';
  if (lastPart.includes('email')) return 'user@example.com';
  if (lastPart.includes('phone')) return '+1 (555) 019-2834';
  if (lastPart.includes('name')) return 'Jane Doe';
  if (
    lastPart.includes('price') ||
    lastPart.includes('cost') ||
    lastPart.includes('total') ||
    lastPart.includes('amount') ||
    lastPart.includes('tax') ||
    lastPart.includes('subtotal')
  ) {
    return '$19.99';
  }
  if (lastPart.includes('quantity') || lastPart.includes('qty') || lastPart.includes('count')) return 1;
  if (lastPart.includes('id') || lastPart.includes('sku') || lastPart.includes('number') || lastPart.includes('code')) {
    return '1001';
  }
  if (lastPart.includes('date')) return '2026-11-01';
  if (lastPart.includes('url') || lastPart.includes('link') || lastPart.includes('href')) return 'https://example.com';
  if (lastPart.includes('src') || lastPart.includes('image') || lastPart.includes('img') || lastPart.includes('banner')) {
    return 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80';
  }
  if (
    lastPart.startsWith('is') ||
    lastPart.startsWith('has') ||
    lastPart.includes('active') ||
    lastPart.includes('enabled') ||
    lastPart.includes('vip') ||
    lastPart.includes('pro')
  ) {
    return true;
  }
  return lastPart;
}

export interface ExtractedTemplateMetadata {
  variables: string[];
  conditions: string[];
  loops: Array<{
    iterable: string;
    itemName: string;
    itemProps: string[];
  }>;
}

export function extractTemplateMetadata(doc: BuilderDocument): ExtractedTemplateMetadata {
  const variables = new Set<string>();
  const conditions = new Set<string>();
  const loops: ExtractedTemplateMetadata['loops'] = [];

  function scanText(str: string | undefined | null, loopContext?: { itemName: string; itemProps: Set<string> }) {
    if (!str) return;
    const extracted = extractVariables(str);
    for (const v of extracted) {
      if (loopContext) {
        const alias = loopContext.itemName;
        if (v.startsWith(`${alias}.`)) {
          loopContext.itemProps.add(v.slice(alias.length + 1));
          continue;
        }
        if (v.startsWith('this.')) {
          loopContext.itemProps.add(v.slice(5));
          continue;
        }
      }
      variables.add(v);
    }
  }

  function scanBlock(b: BuilderBlock, loopContext?: { itemName: string; itemProps: Set<string> }) {
    if (!b) return;
    switch (b.type) {
      case 'text':
        scanText(b.props.content, loopContext);
        scanText(b.props.href, loopContext);
        break;
      case 'heading':
        scanText(b.props.text, loopContext);
        break;
      case 'button':
        scanText(b.props.text, loopContext);
        scanText(b.props.url, loopContext);
        break;
      case 'image':
        scanText(b.props.src, loopContext);
        scanText(b.props.alt, loopContext);
        scanText(b.props.href, loopContext);
        break;
      case 'footer':
        scanText(b.props.text, loopContext);
        scanText(b.props.companyAddress, loopContext);
        scanText(b.props.unsubscribeText, loopContext);
        scanText(b.props.unsubscribeUrl, loopContext);
        break;
      case 'logo':
        scanText(b.props.src, loopContext);
        scanText(b.props.alt, loopContext);
        scanText(b.props.href, loopContext);
        break;
      case 'social':
        for (const item of b.props.items || []) {
          scanText(item.url, loopContext);
        }
        break;
      case 'if-else': {
        const rawCond = (b.props.condition || '').trim();
        const cond = rawCond.replace(/^\{\{\s*#?if\s*/, '').replace(/\s*\}\}$/, '').trim();
        if (cond && /^[a-zA-Z0-9_.]+$/.test(cond)) {
          conditions.add(cond);
        }
        for (const child of b.thenChildren || []) {
          scanBlock(child, loopContext);
        }
        for (const child of b.elseChildren || []) {
          scanBlock(child, loopContext);
        }
        break;
      }
      case 'loop': {
        const rawIter = (b.props.iterable || '').trim();
        const iter = rawIter.replace(/^\{\{\s*#?(each)?\s*/, '').replace(/\s*\}\}$/, '').trim();
        const alias = b.props.itemName || 'item';
        const itemProps = new Set<string>();

        for (const child of b.children || []) {
          scanBlock(child, { itemName: alias, itemProps });
        }

        if (iter) {
          loops.push({
            iterable: iter,
            itemName: alias,
            itemProps: Array.from(itemProps),
          });
        }
        break;
      }
    }
  }

  for (const s of doc.children || []) {
    for (const r of s.children || []) {
      for (const c of r.columns || []) {
        for (const b of c.children || []) {
          scanBlock(b);
        }
      }
    }
  }

  return {
    variables: Array.from(variables),
    conditions: Array.from(conditions),
    loops,
  };
}

export function syncMockDataWithTemplate(
  currentJsonStr: string,
  doc: BuilderDocument
): { jsonStr: string; hasChanges: boolean } {
  let data: Record<string, unknown> = {};
  try {
    data = currentJsonStr && currentJsonStr.trim() ? JSON.parse(currentJsonStr) : {};
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      data = {};
    }
  } catch {
    return { jsonStr: currentJsonStr, hasChanges: false };
  }

  let hasChanges = false;
  const meta = extractTemplateMetadata(doc);

  // 1. Sync Loop arrays
  for (const loop of meta.loops) {
    const existing = getNestedValue(data, loop.iterable);
    if (!existing || !Array.isArray(existing)) {
      // Create exactly 1 clean sample item matching properties used in the loop
      const sampleItem: Record<string, unknown> = {};
      if (loop.itemProps.length > 0) {
        for (const prop of loop.itemProps) {
          sampleItem[prop] = generateSampleValue(prop);
        }
      } else {
        sampleItem.name = 'Wireless Headphones';
        sampleItem.quantity = 1;
        sampleItem.price = '$199.99';
      }
      setNestedValue(data, loop.iterable, [sampleItem]);
      hasChanges = true;
    } else if (existing.length > 0 && typeof existing[0] === 'object' && existing[0] !== null) {
      // Ensure missing properties used in loop template are populated in existing sample item
      const firstItem = existing[0] as Record<string, unknown>;
      for (const prop of loop.itemProps) {
        if (!hasNestedValue(firstItem, prop)) {
          firstItem[prop] = generateSampleValue(prop);
          hasChanges = true;
        }
      }
    }
  }

  // 2. Sync If-Else conditions
  for (const cond of meta.conditions) {
    if (!hasNestedValue(data, cond)) {
      setNestedValue(data, cond, true);
      hasChanges = true;
    }
  }

  // 3. Sync standalone variables
  for (const v of meta.variables) {
    if (!hasNestedValue(data, v)) {
      setNestedValue(data, v, generateSampleValue(v));
      hasChanges = true;
    }
  }

  if (hasChanges) {
    return { jsonStr: JSON.stringify(data, null, 2), hasChanges: true };
  }

  return { jsonStr: currentJsonStr, hasChanges: false };
}

export interface ScopedLoopContext {
  alias: string;
  item: unknown;
  index: number;
  total: number;
}

export interface LoopItemProperty {
  path: string;
  label: string;
  sampleValue: string;
}

export interface LoopItemPropertiesResult {
  props: LoopItemProperty[];
  firstItemProp?: string;
  hasPrice?: boolean;
  sampleItem?: Record<string, unknown>;
  alias: string;
  iterable: string;
}

export function getLoopItemProperties(
  testDataJson: string | undefined | null,
  iterablePath: string | undefined | null,
  alias = 'item'
): LoopItemPropertiesResult {
  const cleanIter = (iterablePath || 'items').replace(/^\{\{\s*#?(each)?\s*/, '').replace(/\s*\}\}$/, '').trim();
  const cleanAlias = (alias || 'item').trim() || 'item';

  let arr: unknown[] = [];
  if (testDataJson) {
    try {
      const data = JSON.parse(testDataJson);
      const val = getNestedValue(data, cleanIter);
      if (Array.isArray(val)) {
        arr = val;
      }
    } catch {
      // ignore
    }
  }

  const firstItem = arr.length > 0 ? arr[0] : null;
  const resultProps: LoopItemProperty[] = [];
  let firstItemProp: string | undefined;
  let hasPrice = false;
  let sampleItem: Record<string, unknown> | undefined;

  if (firstItem && typeof firstItem === 'object') {
    sampleItem = firstItem as Record<string, unknown>;
    const keys = Object.keys(sampleItem);
    for (const k of keys) {
      const val = sampleItem[k];
      resultProps.push({
        path: `${cleanAlias}.${k}`,
        label: `${cleanAlias}.${k}`,
        sampleValue: String(val ?? ''),
      });
      if (k.toLowerCase().includes('price') || k.toLowerCase().includes('cost') || k.toLowerCase().includes('total')) {
        hasPrice = true;
      }
    }

    if (keys.includes('name')) firstItemProp = 'name';
    else if (keys.includes('title')) firstItemProp = 'title';
    else if (keys.length > 0) firstItemProp = keys[0];
  } else if (firstItem !== null && firstItem !== undefined) {
    resultProps.push({
      path: cleanAlias,
      label: `${cleanAlias} (value)`,
      sampleValue: String(firstItem),
    });
  } else {
    // Default fallback props when array is empty or not in test data yet
    resultProps.push(
      { path: `${cleanAlias}.name`, label: `${cleanAlias}.name`, sampleValue: 'Wireless Headphones' },
      { path: `${cleanAlias}.price`, label: `${cleanAlias}.price`, sampleValue: '$199.99' },
      { path: `${cleanAlias}.quantity`, label: `${cleanAlias}.quantity`, sampleValue: '1' }
    );
    firstItemProp = 'name';
    hasPrice = true;
  }

  // Common Handlebars loop variables
  resultProps.push(
    { path: `${cleanAlias}`, label: `${cleanAlias} (full item object)`, sampleValue: '{...}' },
    { path: '@index', label: '@index (0-based index)', sampleValue: '0' },
    { path: '@first', label: '@first (boolean)', sampleValue: 'true' },
    { path: '@last', label: '@last (boolean)', sampleValue: 'false' }
  );

  return {
    props: resultProps,
    firstItemProp,
    hasPrice,
    sampleItem,
    alias: cleanAlias,
    iterable: cleanIter,
  };
}

export function replaceVariablesWithMockData(
  text: string,
  mockJson: string,
  scopedLoopContext?: ScopedLoopContext
): string {
  if (!text) return text;
  try {
    const data = JSON.parse(mockJson);
    let result = text;

    // 0. If scoped loop context is active, evaluate scoped item variables first
    if (scopedLoopContext) {
      const alias = scopedLoopContext.alias || 'item';
      const itemObj = scopedLoopContext.item;

      // Special loop metadata variables
      result = result.replace(/\{\{\s*@index\s*\}\}/g, String(scopedLoopContext.index));
      result = result.replace(/\{\{\s*@first\s*\}\}/g, String(scopedLoopContext.index === 0));
      result = result.replace(
        /\{\{\s*@last\s*\}\}/g,
        String(scopedLoopContext.total > 0 && scopedLoopContext.index === scopedLoopContext.total - 1)
      );

      if (itemObj && typeof itemObj === 'object') {
        const keys = Object.keys(itemObj as Record<string, unknown>);
        for (const k of keys) {
          const val = (itemObj as Record<string, unknown>)[k];
          const kRegex = new RegExp(`\\{\\{\\s*(${alias}\\.${k}|this\\.${k}|item\\.${k}|${k})\\s*\\}\\}`, 'g');
          result = result.replace(kRegex, () => String(val ?? ''));
        }
      } else if (itemObj !== undefined && itemObj !== null) {
        const valStr = String(itemObj);
        const thisRegex = new RegExp(`\\{\\{\\s*(${alias}|this|item)\\s*\\}\\}`, 'g');
        result = result.replace(thisRegex, () => valStr);
      }
    }

    // 1. Process Handlebars {{#each arrayPath( as |alias|)?}} ... {{/each( end)?}} loops
    const eachRegex =
      /\{\{#each\s+([a-zA-Z0-9_.]+)(?:\s+as\s+\|([a-zA-Z0-9_]+)\|)?\}\}([\s\S]*?)\{\{\/each(?:\s+[a-zA-Z0-9_]+)?\}\}/g;
    result = result.replace(eachRegex, (_match, arrayPath, alias, bodyTemplate) => {
      const parts = arrayPath.split('.');
      let curr: unknown = data;
      for (const p of parts) {
        if (curr && typeof curr === 'object' && p in (curr as Record<string, unknown>)) {
          curr = (curr as Record<string, unknown>)[p];
        } else {
          curr = undefined;
          break;
        }
      }

      if (!Array.isArray(curr) || curr.length === 0) {
        return '';
      }

      const itemAlias = alias || 'item';

      return curr
        .map((itemObj: Record<string, unknown> | unknown) => {
          let itemResult = bodyTemplate;
          if (itemObj && typeof itemObj === 'object') {
            const keys = Object.keys(itemObj as Record<string, unknown>);
            for (const k of keys) {
              const val = (itemObj as Record<string, unknown>)[k];
              const kRegex = new RegExp(`\\{\\{\\s*(${itemAlias}\\.${k}|this\\.${k}|${k})\\s*\\}\\}`, 'g');
              itemResult = itemResult.replace(kRegex, () => String(val ?? ''));
            }
          } else {
            const valStr = String(itemObj ?? '');
            const thisRegex = new RegExp(`\\{\\{\\s*(${itemAlias}|this)\\s*\\}\\}`, 'g');
            itemResult = itemResult.replace(thisRegex, () => valStr);
          }
          return itemResult;
        })
        .join('');
    });

    // 2. Process Handlebars {{#if condition}} ... ({{else( branch)?}} ...)? {{/if( end)?}}
    const ifRegex =
      /\{\{#if\s+([a-zA-Z0-9_.]+)\}\}([\s\S]*?)(?:\{\{else(?:\s+[a-zA-Z0-9_]+)?\}\}([\s\S]*?))?\{\{\/if(?:\s+[a-zA-Z0-9_]+)?\}\}/g;
    result = result.replace(ifRegex, (_match, conditionPath, thenBody, elseBody) => {
      const isTrue = evaluateCondition(conditionPath, mockJson, scopedLoopContext);
      return isTrue ? thenBody : (elseBody || '');
    });

    // 3. Fallback helper for item.name / item.price outside explicit loops
    const items = data?.order?.items || data?.items;
    const firstItem = Array.isArray(items) && items.length > 0 ? items[0] : null;
    if (firstItem && typeof firstItem === 'object') {
      for (const k of Object.keys(firstItem)) {
        const itemVal = (firstItem as Record<string, unknown>)[k];
        const replaceItemRegex = new RegExp(`\\{\\{\\s*item\\.${k}\\s*\\}\\}`, 'g');
        result = result.replace(replaceItemRegex, () => String(itemVal ?? ''));
      }
    }

    // 4. Process standard {{variable.path}} tags
    const vars = extractVariables(result);
    for (const v of vars) {
      const val = getNestedValue(data, v);
      if (val !== undefined && val !== null) {
        const replaceRegex = new RegExp(`\\{\\{\\s*${v.replace(/\./g, '\\.')}\\s*\\}\\}`, 'g');
        result = result.replace(replaceRegex, () => String(val));
      }
    }

    return result;
  } catch {
    return text;
  }
}

export function evaluateCondition(
  condition: string | undefined | null,
  mockJson?: string,
  scopedLoopContext?: ScopedLoopContext
): boolean {
  if (!condition || !condition.trim()) return true;
  if (!mockJson) return true;

  try {
    const data = JSON.parse(mockJson);
    const cond = condition.trim().replace(/^\{\{\s*#?if\s*/, '').replace(/\s*\}\}$/, '').trim();

    // Check scoped item first if available
    if (scopedLoopContext && scopedLoopContext.item && typeof scopedLoopContext.item === 'object') {
      const alias = scopedLoopContext.alias || 'item';
      let prop = cond;
      if (cond.startsWith(`${alias}.`)) {
        prop = cond.slice(alias.length + 1);
      } else if (cond.startsWith('this.')) {
        prop = cond.slice(5);
      }
      if (prop in (scopedLoopContext.item as Record<string, unknown>)) {
        return Boolean((scopedLoopContext.item as Record<string, unknown>)[prop]);
      }
    }

    // Direct path lookup e.g. "order.isVip" or "user.isPremium"
    if (/^[a-zA-Z0-9_.]+$/.test(cond)) {
      const parts = cond.split('.');
      let curr: unknown = data;
      for (const p of parts) {
        if (curr && typeof curr === 'object' && p in (curr as Record<string, unknown>)) {
          curr = (curr as Record<string, unknown>)[p];
        } else {
          curr = undefined;
          break;
        }
      }
      return Boolean(curr);
    }

    // Try safe expression evaluation if variables are available
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const fn = new Function(...keys, `try { return Boolean(${cond}); } catch(e) { return false; }`);
      return Boolean(fn(...values));
    } catch {
      return false;
    }
  } catch {
    return true;
  }
}

export function resolveIterable(iterablePath: string | undefined | null, mockJson?: string): unknown[] {
  if (!iterablePath || !iterablePath.trim()) return [];
  if (!mockJson) return [];

  try {
    const data = JSON.parse(mockJson);
    const cleanPath = iterablePath.trim().replace(/^\{\{\s*#?(each)?\s*/, '').replace(/\s*\}\}$/, '').trim();
    const parts = cleanPath.split('.');
    let curr: unknown = data;
    for (const p of parts) {
      if (curr && typeof curr === 'object' && p in (curr as Record<string, unknown>)) {
        curr = (curr as Record<string, unknown>)[p];
      } else {
        curr = undefined;
        break;
      }
    }
    if (Array.isArray(curr)) return curr;
    return [];
  } catch {
    return [];
  }
}
