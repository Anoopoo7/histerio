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
      name: 'test user',
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

export function replaceVariablesWithMockData(text: string, mockJson: string): string {
  if (!text) return text;
  try {
    const data = JSON.parse(mockJson);
    let result = text;

    // 1. Process Handlebars {{#each arrayPath}} ... {{/each}} loops
    const eachRegex = /\{\{#each\s+([a-zA-Z0-9_.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    result = result.replace(eachRegex, (_match, arrayPath, bodyTemplate) => {
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

      return curr
        .map((itemObj: Record<string, unknown> | unknown) => {
          let itemResult = bodyTemplate;
          if (itemObj && typeof itemObj === 'object') {
            const keys = Object.keys(itemObj as Record<string, unknown>);
            for (const k of keys) {
              const val = (itemObj as Record<string, unknown>)[k];
              const kRegex = new RegExp(`\\{\\{\\s*(this\\.${k}|item\\.${k}|${k})\\s*\\}\\}`, 'g');
              itemResult = itemResult.replace(kRegex, String(val ?? ''));
            }
          } else {
            itemResult = itemResult.replace(/\{\{\s*this\s*\}\}/g, String(itemObj ?? ''));
          }
          return itemResult;
        })
        .join('');
    });

    // 2. Fallback helper for item.name / item.price outside explicit loops
    const items = data?.order?.items;
    const firstItem = Array.isArray(items) && items.length > 0 ? items[0] : null;
    if (firstItem) {
      for (const k of Object.keys(firstItem)) {
        const itemVal = firstItem[k];
        const replaceItemRegex = new RegExp(`\\{\\{\\s*item\\.${k}\\s*\\}\\}`, 'g');
        result = result.replace(replaceItemRegex, String(itemVal ?? ''));
      }
    }

    // 3. Process standard {{variable.path}} tags
    const vars = extractVariables(result);
    for (const v of vars) {
      const parts = v.split('.');
      let curr: unknown = data;
      for (const p of parts) {
        if (curr && typeof curr === 'object' && p in (curr as Record<string, unknown>)) {
          curr = (curr as Record<string, unknown>)[p];
        } else {
          curr = undefined;
          break;
        }
      }
      if (curr !== undefined && curr !== null) {
        const replaceRegex = new RegExp(`\\{\\{\\s*${v.replace('.', '\\.')}\\s*\\}\\}`, 'g');
        result = result.replace(replaceRegex, String(curr));
      }
    }

    return result;
  } catch {
    return text;
  }
}
