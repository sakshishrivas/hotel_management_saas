import { BookingList } from '@/features/bookings/components/booking-list';
import { PageHeader } from '@/components/shared/page-header';

export default function BookingsPage() {
  return (
    <>
      <PageHeader
        title="Bookings"
        description="Manage your hotel bookings and reservations."
        actionButton={{
          label: 'New Booking',
          href: '/bookings/new',
        }}
      />
      <BookingList />
    </>
  );
}
