/**
 * Consistent date/time formatter for Histeria dashboard
 * Example: 12 Sep 2026, 10:32 AM
 */
export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Relative time formatter (e.g. "2 minutes ago", "just now")
 */
export function formatRelativeTime(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return '—';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 30) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;

  return formatDate(d);
}

/**
 * Sanitizes HTML content for admin preview to ensure opening an email
 * in the admin dashboard preview NEVER triggers false OPENED or CLICKED tracking requests.
 */
export function sanitizeHtmlForAdminPreview(html: string): string {
  if (!html || typeof html !== 'string') return html || '';

  let sanitized = html;

  // 1. Remove or neutralize tracking pixel <img> tags containing /v1/tracking/open/ or /tracking/open/
  sanitized = sanitized.replace(
    /<img[^>]*src=["'][^"']*\/tracking\/open\/[^"']*["'][^>]*\/?>/gi,
    ''
  );

  // Replace any remaining tracking image src URLs with a neutral 1x1 transparent data GIF
  sanitized = sanitized.replace(
    /src=["'](https?:\/\/[^"'\s>]+\/v1\/tracking\/open\/[^"'\s>]+)["']/gi,
    'src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"'
  );

  // 2. Rewrite tracking click URLs back to their original target URL in href attributes
  const clickTrackingRegex = /href=(["'])(https?:\/\/[^"'\s>]+\/v1\/tracking\/click\/[^"'\s>]+\?url=([^"'\s>&]+)[^"'\s>]*)\1/gi;
  sanitized = sanitized.replace(
    clickTrackingRegex,
    (_match, quote, _fullTrackingUrl, encodedTargetUrl) => {
      try {
        const decodedUrl = decodeURIComponent(encodedTargetUrl);
        return `href=${quote}${decodedUrl}${quote}`;
      } catch {
        return _match;
      }
    }
  );

  return sanitized;
}
