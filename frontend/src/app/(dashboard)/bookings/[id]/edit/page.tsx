'use client';

import { useParams } from 'next/navigation';
import { BookingForm } from '@/features/bookings/components/booking-form';
import { PageHeader } from '@/components/shared/page-header';
import { useBooking } from '@/features/bookings/hooks/use-bookings';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBookingPage() {
  const params = useParams();
  const bookingId = params.id as string;
  
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
        Failed to load booking details.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Edit Booking"
        description={`Update details for booking ${data.data.bookingReference}`}
      />
      <div className="bg-card border rounded-lg p-6">
        <BookingForm initialData={data.data} />
      </div>
    </>
  );
}
