'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Modal, Button } from '@/components/ui';
import { ShieldCheck } from 'lucide-react';


export interface OrganizationConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  orgName: string;
}

export function OrganizationConsentModal({
  isOpen,
  onClose,
  onConfirm,
  orgName,
}: OrganizationConsentModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!accepted) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
      setAccepted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Organization Policy Confirmation"
      description={`Before creating organization "${orgName || 'New Organization'}", please review policy responsibilities.`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" size="md" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={!accepted || isSubmitting}
            onClick={handleConfirm}
          >
            Confirm & Create Organization
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            Organization Responsibilities
          </div>
          <p className="leading-relaxed">
            By creating an organization, you confirm that your team will use Histeria in compliance with applicable laws and platform rules:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1">
            <li>Your organization is responsible for all activity performed under its API keys and SMTP configs.</li>
            <li>Recipient email data must be legally acquired with appropriate rights and consents.</li>
            <li>Unsolicited bulk email, spam, phishing, and list scraping are strictly prohibited under the Anti-Spam Policy.</li>
          </ul>
        </div>

        {/* Links to Legal Documents */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 font-medium">
          <Link href="/legal/terms" target="_blank" className="text-indigo-400 hover:underline">
            Terms of Service
          </Link>
          <Link href="/legal/acceptable-use" target="_blank" className="text-indigo-400 hover:underline">
            Acceptable Use Policy
          </Link>
          <Link href="/legal/anti-spam" target="_blank" className="text-indigo-400 hover:underline">
            Anti-Spam Policy
          </Link>
          <Link href="/legal/privacy" target="_blank" className="text-indigo-400 hover:underline">
            Privacy Policy
          </Link>
        </div>

        {/* Mandatory Checkbox */}
        <label
          htmlFor="org-policy-consent-checkbox"
          className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all select-none cursor-pointer ${
            accepted
              ? 'bg-indigo-500/10 border-indigo-500/30 text-zinc-200'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <input
            id="org-policy-consent-checkbox"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950 shrink-0 cursor-pointer"
          />
          <span className="text-xs leading-relaxed font-medium">
            I confirm that I have read, understood, and agree that our organization will adhere to the applicable Histeria Terms and Acceptable Use policies.
          </span>
        </label>
      </div>
    </Modal>
  );
}
