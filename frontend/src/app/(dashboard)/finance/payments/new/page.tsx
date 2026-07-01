import { RecordPaymentForm } from '@/features/finance/payments/components/record-payment-form';
import { PageHeader } from '@/components/shared/page-header';

export default function NewPaymentPage() {
  return (
    <>
      <PageHeader
        title="Record Payment"
        description="Log a new payment received from a guest."
      />
      <div className="bg-card border rounded-lg p-6">
        <RecordPaymentForm />
      </div>
    </>
  );
}
