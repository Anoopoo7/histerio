'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Badge } from '@/components/ui';
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Eye,
  Code2,
  Undo2,
  Redo2,
  Save,
  Send,
} from 'lucide-react';

export interface BuilderTopBarProps {
  templateName: string;
  templateStatus: string;
  versionNumber?: number;
  subject: string;
  onSubjectChange: (val: string) => void;
  deviceView: 'desktop' | 'mobile';
  onDeviceViewChange: (view: 'desktop' | 'mobile') => void;
  viewTab: 'design' | 'preview' | 'html';
  onViewTabChange: (tab: 'design' | 'preview' | 'html') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onSendTestEmail?: () => void;
}

export function BuilderTopBar({
  templateName,
  templateStatus,
  versionNumber,
  subject,
  onSubjectChange,
  deviceView,
  onDeviceViewChange,
  onViewTabChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isDirty,
  isSaving,
  onSave,
  onSendTestEmail,
}: BuilderTopBarProps) {
  return (
    <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none">
      {/* Left section: Back button & Template info */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/templates">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-zinc-100 tracking-tight">{templateName}</h1>
            <Badge variant="purple" size="sm" dot={false}>
              BUILDER
            </Badge>
            <Badge
              variant={templateStatus === 'ACTIVE' ? 'success' : templateStatus === 'ARCHIVED' ? 'neutral' : 'warning'}
              size="sm"
            >
              {templateStatus}
            </Badge>
            {versionNumber && (
              <Badge variant="info" size="sm" dot={false}>
                v{versionNumber}
              </Badge>
            )}
            {isDirty && (
              <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                • Unsaved changes
              </span>
            )}
          </div>

          {/* Email Subject Field */}
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="e.g. Your order {{order.id}} has shipped"
              className="bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 w-64 font-sans"
            />
          </div>
        </div>
      </div>

      {/* Middle section: Device & View Mode Tabs */}
      <div className="flex items-center gap-2">
        {/* Device Switcher */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => onDeviceViewChange('desktop')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              deviceView === 'desktop'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Desktop View (600px)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => onDeviceViewChange('mobile')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              deviceView === 'mobile'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mobile View (360px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* View Mode Buttons */}
        <Button variant="outline" size="sm" onClick={() => onViewTabChange('preview')} leftIcon={<Eye className="w-3.5 h-3.5 text-emerald-400" />}>
          Preview
        </Button>
        <Button variant="outline" size="sm" onClick={() => onViewTabChange('html')} leftIcon={<Code2 className="w-3.5 h-3.5 text-purple-400" />}>
          HTML
        </Button>
      </div>

      {/* Right section: History & Actions */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
          title="Undo (Cmd+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {onSendTestEmail && (
          <Button variant="outline" size="sm" onClick={onSendTestEmail} leftIcon={<Send className="w-3.5 h-3.5 text-indigo-400" />}>
            Send Test
          </Button>
        )}

        <Button size="sm" onClick={onSave} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
          Save Version
        </Button>
      </div>
    </div>
  );
}
