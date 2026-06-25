import { BookingForm } from '@/features/bookings/components/booking-form';
import { PageHeader } from '@/components/shared/page-header';

export default function NewBookingPage() {
  return (
    <>
      <PageHeader
        title="New Booking"
        description="Create a new reservation."
      />
      <div className="bg-card border rounded-lg p-6">
        <BookingForm />
      </div>
    </>
  );
}
