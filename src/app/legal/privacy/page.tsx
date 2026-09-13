import { Metadata } from 'next';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

export const metadata: Metadata = {
  title: 'Privacy Policy | Histeria',
  description: 'Histeria Privacy Policy detailing data collection, email processing, and user rights.',
};

export default function PrivacyPage() {
  return <LegalDocumentView documentType="privacy" />;
}
