export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return true;

  const trimmed = url.trim().toLowerCase();
  if (trimmed === '' || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return true;
  }

  // Reject dangerous schemes
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('file:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('blob:')
  ) {
    return false;
  }

  // Allow standard safe protocols
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')) {
    return true;
  }

  // If protocol specified but not in safe list, reject
  if (/^[a-z0-9+-.]+:/i.test(trimmed)) {
    return false;
  }

  return true;
}

export function sanitizeUrl(url: string | undefined | null, fallback = 'https://example.com'): string {
  if (isSafeUrl(url)) {
    return url || '';
  }
  return fallback;
}
