'use client';

import { useParams } from 'next/navigation';
import { CheckOutForm } from '@/features/front-desk/components/check-out-form';
import { PageHeader } from '@/components/shared/page-header';
import { useBooking } from '@/features/bookings/hooks/use-bookings';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckOutPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  
  const { data, isLoading, isError } = useBooking(bookingId);

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
        Failed to load booking details for check-out.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Check-Out"
        description={`Process check-out for booking ${data.data.bookingReference}`}
      />
      <div className="bg-card border rounded-lg p-6 max-w-2xl">
        <CheckOutForm bookingId={bookingId} />
      </div>
    </>
  );
}
