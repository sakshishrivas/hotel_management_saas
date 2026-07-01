import { PaymentList } from '@/features/finance/payments/components/payment-list';
import { PageHeader } from '@/components/shared/page-header';

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payments"
        description="View and manage received payments and allocations."
        actionButton={{
          label: 'Record Payment',
          href: '/finance/payments/new',
        }}
      />
      <PaymentList />
    </>
  );
}
