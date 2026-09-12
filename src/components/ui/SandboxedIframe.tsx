'use client';

import React, { useMemo } from 'react';
import { sanitizeHtmlForAdminPreview } from '@/lib/utils/format';

export interface SandboxedIframeProps {
  html: string;
  title?: string;
  className?: string;
  minHeight?: string;
}

export function SandboxedIframe({
  html,
  title = 'Email Preview',
  className = '',
  minHeight = '450px',
}: SandboxedIframeProps) {
  const safeHtml = useMemo(() => sanitizeHtmlForAdminPreview(html), [html]);

  return (
    <div className={`w-full rounded-lg border border-zinc-800 bg-white overflow-hidden ${className}`}>
      <iframe
        srcDoc={safeHtml}
        title={title}
        sandbox="allow-same-origin"
        className="w-full border-0 block"
        style={{ minHeight }}
      />
    </div>
  );
}
