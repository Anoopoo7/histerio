import { Metadata } from 'next';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

export const metadata: Metadata = {
  title: 'Data Processing Agreement (DPA) | Histeria',
  description: 'Controller and processor responsibilities for transactional email recipient data.',
};

export default function DpaPage() {
  return <LegalDocumentView documentType="dpa" />;
}
