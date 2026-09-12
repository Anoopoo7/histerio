export interface VariableOption {
  path: string;
  label: string;
  category: 'Customer' | 'Order' | 'Company' | 'System';
}

export const COMMON_VARIABLES: VariableOption[] = [
  { path: 'customer.name', label: 'Customer Name', category: 'Customer' },
  { path: 'customer.email', label: 'Customer Email', category: 'Customer' },
  { path: 'order.id', label: 'Order ID', category: 'Order' },
  { path: 'order.total', label: 'Order Total', category: 'Order' },
  { path: 'order.status', label: 'Order Status', category: 'Order' },
  { path: 'company.name', label: 'Company Name', category: 'Company' },
  { path: 'company.support_email', label: 'Support Email', category: 'Company' },
];

export function isValidVariablePath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  const trimmed = path.trim();
  // Valid Handlebars path: letters, numbers, underscores, dots
  return /^[a-zA-Z0-9_.]+(\.[a-zA-Z0-9_.]+)*$/.test(trimmed);
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
  const regex = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
  const set = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      set.add(match[1]);
    }
  }
  return Array.from(set);
}

export function replaceVariablesWithMockData(text: string, mockJson: string): string {
  if (!text) return text;
  try {
    const data = JSON.parse(mockJson);
    const vars = extractVariables(text);

    let result = text;
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
