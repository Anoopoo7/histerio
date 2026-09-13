import { Metadata } from 'next';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

export const metadata: Metadata = {
  title: 'Terms of Service | Histeria',
  description: 'Histeria SaaS Terms of Service governing accounts, API usage, and email responsibilities.',
};

export default function TermsPage() {
  return <LegalDocumentView documentType="terms" />;
}
