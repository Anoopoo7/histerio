'use client';

import React, { useState } from 'react';
import { COMMON_VARIABLES, isValidVariablePath } from '../utils/variableUtils';
import { Button, Input } from '@/components/ui';
import { Variable, Plus, Tag, Check } from 'lucide-react';

export interface VariablePickerPopoverProps {
  onSelectVariable: (varTag: string) => void;
  onClose?: () => void;
}

export function VariablePickerPopover({ onSelectVariable, onClose }: VariablePickerPopoverProps) {
  const [customPath, setCustomPath] = useState('');
  const [customError, setCustomError] = useState('');
  const [copiedTag, setCopiedTag] = useState('');

  const handleSelect = (path: string) => {
    const tag = `{{${path}}}`;
    onSelectVariable(tag);
    setCopiedTag(tag);
    setTimeout(() => {
      setCopiedTag('');
      onClose?.();
    }, 600);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customPath.trim();
    if (!trimmed) return;

    if (!isValidVariablePath(trimmed)) {
      setCustomError('Invalid path format. Use letters, numbers, and dots (e.g. order.shipping.city)');
      return;
    }

    setCustomError('');
    handleSelect(trimmed);
  };

  return (
    <div className="w-80 p-3 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl space-y-3 text-xs text-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-zinc-100">
          <Variable className="w-4 h-4 text-purple-400" />
          <span>Insert Handlebars Variable</span>
        </div>
      </div>

      {/* Common Quick Pick Variables */}
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
          Known Variables
        </span>
        {COMMON_VARIABLES.map((v) => (
          <button
            key={v.path}
            type="button"
            onClick={() => handleSelect(v.path)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-left group"
          >
            <div>
              <span className="font-semibold text-zinc-200 block group-hover:text-purple-300">
                {v.label}
              </span>
              <span className="font-mono text-[11px] text-zinc-400">{`{{${v.path}}}`}</span>
            </div>
            {copiedTag === `{{${v.path}}}` ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Tag className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Custom Variable Input Section */}
      <form onSubmit={handleAddCustom} className="pt-2 border-t border-zinc-800 space-y-2">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
          Custom Variable Path
        </span>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. invoice.payment.id"
            value={customPath}
            onChange={(e) => {
              setCustomPath(e.target.value);
              setCustomError('');
            }}
            className="font-mono text-xs"
          />
          <Button size="sm" type="submit" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Insert
          </Button>
        </div>
        {customError && <p className="text-[11px] text-rose-400">{customError}</p>}
      </form>
    </div>
  );
}
