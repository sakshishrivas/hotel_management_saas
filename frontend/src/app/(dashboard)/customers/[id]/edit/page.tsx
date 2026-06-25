'use client';

import { useParams } from 'next/navigation';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { PageHeader } from '@/components/shared/page-header';
import { useCustomer } from '@/features/customers/hooks/use-customers';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCustomerPage() {
  const params = useParams();
  const customerId = params.id as string;
  
  const { data, isLoading, isError } = useCustomer(customerId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load customer details.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Edit Customer"
        description={`Update details for ${data.data.firstName} ${data.data.lastName}`}
      />
      <div className="bg-card border rounded-lg p-6">
        <CustomerForm initialData={data.data} />
      </div>
    </>
  );
}
