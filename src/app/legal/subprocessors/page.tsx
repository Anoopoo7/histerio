import { Metadata } from 'next';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

export const metadata: Metadata = {
  title: 'Subprocessors List | Histeria',
  description: 'List of third-party infrastructure and payment subprocessors used by Histeria.',
};

export default function SubprocessorsPage() {
  return <LegalDocumentView documentType="subprocessors" />;
}
