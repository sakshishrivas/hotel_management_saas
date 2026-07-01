import { InvoiceList } from '@/features/finance/invoices/components/invoice-list';
import { GenerateInvoiceDialog } from '@/features/finance/invoices/components/generate-invoice-dialog';
import { PageHeader } from '@/components/shared/page-header';

export default function InvoicesPage() {
  return (
    <>
      <PageHeader
        title="Invoices"
        description="Manage billing and invoices for bookings."
      >
        <GenerateInvoiceDialog />
      </PageHeader>
      <InvoiceList />
    </>
  );
}
