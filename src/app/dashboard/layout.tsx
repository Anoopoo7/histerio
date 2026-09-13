import React from 'react';
import { DashboardShell } from '@/components/layout';
import { LegalAcceptanceGate } from '@/components/legal/LegalAcceptanceGate';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <LegalAcceptanceGate />
      {children}
    </DashboardShell>
  );
}

