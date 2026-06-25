import { CustomerList } from '@/features/customers/components/customer-list';
import { PageHeader } from '@/components/shared/page-header';

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your hotel customers and their profiles."
        actionButton={{
          label: 'Add Customer',
          href: '/customers/new',
        }}
      />
      <CustomerList />
    </>
  );
}
