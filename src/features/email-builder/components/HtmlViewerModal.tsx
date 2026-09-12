'use client';

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@/components/ui';
import { Copy, Check } from 'lucide-react';

export interface HtmlViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
}

export function HtmlViewerModal({ isOpen, onClose, html }: HtmlViewerModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compiled Email HTML (Read-Only)"
      description="Exact email-safe HTML output compiled from the visual builder AST."
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Badge variant="purple" size="sm" dot={false}>
            Email Client Compatible
          </Badge>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied HTML!' : 'Copy HTML'}
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto max-h-[460px] font-mono text-xs text-emerald-300/90 leading-relaxed shadow-inner">
          <pre>{html}</pre>
        </div>
        <p className="text-[11px] text-zinc-400">
          Note: Direct editing of HTML in Builder mode is disabled to maintain two-way state integrity. Switch to CODE editor mode if you wish to write raw HTML directly.
        </p>
      </div>
    </Modal>
  );
}
