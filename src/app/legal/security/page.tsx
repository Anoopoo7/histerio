import { Metadata } from 'next';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

export const metadata: Metadata = {
  title: 'Security & Data Protection Disclosures | Histeria',
  description: 'Technical access controls, API key security, and credential encryption.',
};

export default function SecurityPage() {
  return <LegalDocumentView documentType="security" />;
}
