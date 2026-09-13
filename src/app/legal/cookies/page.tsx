import { Metadata } from 'next';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

export const metadata: Metadata = {
  title: 'Cookie & Local Storage Policy | Histeria',
  description: 'Technical cookies and local storage mechanisms used by Histeria for authentication.',
};

export default function CookiesPage() {
  return <LegalDocumentView documentType="cookie" />;
}
