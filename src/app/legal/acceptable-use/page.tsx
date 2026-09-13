import { Metadata } from 'next';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | Histeria',
  description: 'Prohibited uses, spam prevention, and security rules for Histeria email platform.',
};

export default function AcceptableUsePage() {
  return <LegalDocumentView documentType="acceptable-use" />;
}
