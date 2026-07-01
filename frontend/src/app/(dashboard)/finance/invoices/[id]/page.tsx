import { InvoiceDetails } from '@/features/finance/invoices/components/invoice-details';
import { PageHeader } from '@/components/shared/page-header';

export default function InvoiceDetailsPage() {
  return (
    <>
      <PageHeader
        title="Invoice Manager"
        description="View and manage invoice line items, discounts, and taxes."
      />
      <InvoiceDetails />
    </>
  );
}
