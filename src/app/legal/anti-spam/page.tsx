import { Metadata } from 'next';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

export const metadata: Metadata = {
  title: 'Anti-Spam & Transactional Email Policy | Histeria',
  description: 'Rules for transactional email and strict anti-spam enforcement on Histeria.',
};

export default function AntiSpamPage() {
  return <LegalDocumentView documentType="anti-spam" />;
}
