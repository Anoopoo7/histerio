'use client';

import React from 'react';
import Link from 'next/link';

export interface RegistrationConsentProps {
  accepted: boolean;
  onConsentChange: (accepted: boolean) => void;
  disabled?: boolean;
}

export function RegistrationConsent({
  accepted,
  onConsentChange,
  disabled = false,
}: RegistrationConsentProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="registration-consent-checkbox"
        className={`flex items-start gap-3 p-3 rounded-xl border transition-all select-none cursor-pointer ${
          accepted
            ? 'bg-indigo-500/10 border-indigo-500/30 text-zinc-200'
            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          id="registration-consent-checkbox"
          type="checkbox"
          checked={accepted}
          disabled={disabled}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950 shrink-0 cursor-pointer"
        />
        <span className="text-xs leading-relaxed">
          I agree to the{' '}
          <Link
            href="/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            Terms of Service
          </Link>{' '}
          and acknowledge the{' '}
          <Link
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>
    </div>
  );
}
