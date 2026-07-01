import { RefundList } from '@/features/finance/refunds/components/refund-list';
import { ProcessRefundDialog } from '@/features/finance/refunds/components/process-refund-dialog';
import { PageHeader } from '@/components/shared/page-header';

export default function RefundsPage() {
  return (
    <>
      <PageHeader
        title="Refunds"
        description="View and process guest refunds."
      >
        <ProcessRefundDialog />
      </PageHeader>
      <RefundList />
    </>
  );
}
