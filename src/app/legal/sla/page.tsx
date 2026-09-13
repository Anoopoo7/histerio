import { Metadata } from 'next';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

export const metadata: Metadata = {
  title: 'Service Availability & SLA Disclosures | Histeria',
  description: 'Operational availability commitments and infrastructure disclosures for Histeria.',
};

export default function SlaPage() {
  return <LegalDocumentView documentType="sla" />;
}
