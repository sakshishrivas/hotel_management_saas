import { CustomerForm } from '@/features/customers/components/customer-form';
import { PageHeader } from '@/components/shared/page-header';

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader
        title="New Customer"
        description="Add a new customer profile."
      />
      <div className="bg-card border rounded-lg p-6">
        <CustomerForm />
      </div>
    </>
  );
}
