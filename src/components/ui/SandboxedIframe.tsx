'use client';

import React from 'react';

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
  return (
    <div className={`w-full rounded-lg border border-zinc-800 bg-white overflow-hidden ${className}`}>
      <iframe
        srcDoc={html}
        title={title}
        sandbox="allow-same-origin"
        className="w-full border-0 block"
        style={{ minHeight }}
      />
    </div>
  );
}
