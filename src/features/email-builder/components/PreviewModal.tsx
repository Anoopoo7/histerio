'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Button, Badge, SandboxedIframe } from '@/components/ui';
import { Monitor, Smartphone, Variable } from 'lucide-react';
import { DEFAULT_MOCK_DATA_JSON, replaceVariablesWithMockData } from '../utils/variableUtils';

export interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  sampleJson?: string;
}

export function PreviewModal({ isOpen, onClose, html, sampleJson: initialSampleJson }: PreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [sampleJson, setSampleJson] = useState(initialSampleJson || DEFAULT_MOCK_DATA_JSON);
  const [prevInitialJson, setPrevInitialJson] = useState(initialSampleJson);

  if (initialSampleJson !== prevInitialJson) {
    setPrevInitialJson(initialSampleJson);
    if (initialSampleJson) {
      setSampleJson(initialSampleJson);
    }
  }

  const previewHtml = useMemo(() => {
    return replaceVariablesWithMockData(html, sampleJson);
  }, [html, sampleJson]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Preview"
      description="Live sandboxed preview of compiled email HTML with sample variable substitution."
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowJsonEditor(!showJsonEditor)}
            leftIcon={<Variable className="w-3.5 h-3.5 text-purple-400" />}
          >
            {showJsonEditor ? 'Hide Test Data' : 'Edit Test Variables JSON'}
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Device Switcher Bar */}
        <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                device === 'desktop'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop (600px)</span>
            </button>

            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                device === 'mobile'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (360px)</span>
            </button>
          </div>

          <Badge variant="success" size="sm" dot={false}>
            Sandboxed Iframe
          </Badge>
        </div>

        {/* Sample Variable JSON Editor */}
        {showJsonEditor && (
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Sample Variable Test Data (JSON)</span>
              <span className="text-[11px] italic">Replaces Handlebars tags in preview</span>
            </div>
            <textarea
              value={sampleJson}
              onChange={(e) => setSampleJson(e.target.value)}
              className="w-full h-28 p-2 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none"
            />
          </div>
        )}

        {/* Preview Frame Container */}
        <div className="flex justify-center bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-x-auto min-h-[420px]">
          <div
            className="transition-all duration-300 bg-white rounded-lg shadow-xl overflow-hidden"
            style={{
              width: device === 'desktop' ? '600px' : '360px',
              minHeight: '400px',
            }}
          >
            <SandboxedIframe html={previewHtml} minHeight="400px" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
