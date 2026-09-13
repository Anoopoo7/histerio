import { Metadata } from 'next';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Histeria',
  description: 'Billing cycles, cancellations, Razorpay payments, and refund terms.',
};

export default function RefundsPage() {
  return <LegalDocumentView documentType="refunds" />;
}
