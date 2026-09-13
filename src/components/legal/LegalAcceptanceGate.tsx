'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal, Button } from '@/components/ui';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRequiredRegistrationPolicies } from '@/lib/legal';
import { getUserConsentsApi, recordConsentApi } from '@/lib/api/legal.api';
import { PolicyMetadata } from '@/types/legal';

export function LegalAcceptanceGate() {
  const { isAuthenticated, user } = useAuth();
  const [unacceptedPolicies, setUnacceptedPolicies] = useState<PolicyMetadata[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    let isMounted = true;

    getUserConsentsApi().then((userConsents) => {
      if (!isMounted) return;
      const required = getRequiredRegistrationPolicies();
      const pending = required.filter((reqPolicy) => {
        const hasAcceptedCurrent = userConsents.some(
          (c) => c.documentType === reqPolicy.documentType && c.documentVersion === reqPolicy.version,
        );
        return !hasAcceptedCurrent;
      });

      if (pending.length > 0) {
        setUnacceptedPolicies(pending);
        setIsOpen(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  const handleAcceptAll = async () => {
    if (!accepted || unacceptedPolicies.length === 0) return;
    setIsSubmitting(true);

    try {
      for (const policy of unacceptedPolicies) {
        await recordConsentApi({
          documentType: policy.documentType,
          documentVersion: policy.version,
        });
      }
      setIsOpen(false);
    } catch {
      // Failed to record consent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || unacceptedPolicies.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Cannot close without accepting material policy updates
      title="Updated Legal Terms Required"
      description="We have updated our Terms of Service & Privacy Policy. Please review and accept to continue using Histeria."
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={!accepted || isSubmitting}
            onClick={handleAcceptAll}
          >
            Accept & Continue to Dashboard
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <ShieldAlert className="w-4 h-4" />
            Updated Agreements
          </div>
          <p className="leading-relaxed">
            The following policy agreements require your review and explicit agreement before proceeding:
          </p>
        </div>

        <div className="space-y-3">
          {unacceptedPolicies.map((p) => (
            <div
              key={p.documentType}
              className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-100 text-sm">{p.title}</span>
                <span className="font-mono text-[11px] text-indigo-400">v{p.version}</span>
              </div>
              <p className="text-zinc-400 text-xs">{p.shortSummary}</p>
              <div className="pt-1">
                <Link
                  href={`/legal/${p.documentType}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline font-medium"
                >
                  <span>Read full document</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Mandatory Checkbox */}
        <label
          htmlFor="legal-gate-consent-checkbox"
          className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all select-none cursor-pointer ${
            accepted
              ? 'bg-indigo-500/10 border-indigo-500/30 text-zinc-200'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <input
            id="legal-gate-consent-checkbox"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950 shrink-0 cursor-pointer"
          />
          <span className="text-xs leading-relaxed font-medium">
            I confirm that I have reviewed and agree to the updated Histeria legal policies.
          </span>
        </label>
      </div>
    </Modal>
  );
}
