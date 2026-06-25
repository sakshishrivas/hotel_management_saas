'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBooking, useCancelBooking } from '@/features/bookings/hooks/use-bookings';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
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

  const booking = data.data;

  return (
    <>
      <PageHeader
        title={`Booking ${booking.bookingReference}`}
        description="Detailed view of the reservation and its guests."
        actionButton={
          booking.status !== 'cancelled' && booking.status !== 'checked_out' ? {
            label: 'Edit Booking',
            onClick: () => router.push(`/bookings/${booking.id}/edit`)
          } : undefined
        }
      >
        <StatusBadge status={booking.status} className="ml-4" />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Stay Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-medium">{booking.adults} Adults, {booking.children} Children</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium text-lg text-primary">{booking.totalAmount} {booking.currencyCode}</p>
                </div>
              </div>
              
              {booking.specialRequests && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                    <p className="text-sm">{booking.specialRequests}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rooms & Guests</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.bookingRooms && booking.bookingRooms.length > 0 ? (
                <div className="space-y-4">
                  {booking.bookingRooms.map((room) => (
                    <div key={room.id} className="border p-4 rounded-lg bg-muted/5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{room.roomType?.name || 'Room Type'} - {room.room?.roomNumber || 'Unassigned'}</p>
                          <p className="text-sm text-muted-foreground">{room.adults} Adults, {room.children} Children</p>
                        </div>
                        <p className="font-medium text-right">{room.totalRoomAmount} {booking.currencyCode}</p>
                      </div>
                      <Separator className="my-2" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Guests in this room</p>
                        {room.guests && room.guests.length > 0 ? (
                          <ul className="space-y-1">
                            {room.guests.map(guest => (
                              <li key={guest.id} className="text-sm flex items-center justify-between">
                                <span>{guest.fullName} {guest.isPrimary && <StatusBadge status="info" className="ml-2 text-[10px] px-1 py-0 h-4" />}</span>
                                {guest.documentNo && <span className="text-xs text-muted-foreground">{guest.documentType}: {guest.documentNo}</span>}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No guests added yet.</p>
                        )}
                        <div className="mt-3">
                          <Button variant="outline" size="sm">Manage Guests</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No rooms found for this booking.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.customer ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-lg">{booking.customer.firstName} {booking.customer.lastName}</p>
                    <p className="text-sm text-muted-foreground">Primary Contact</p>
                  </div>
                  {booking.customer.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-sm">{booking.customer.email}</p>
                    </div>
                  )}
                  {booking.customer.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-sm">{booking.customer.phone}</p>
                    </div>
                  )}
                  <Button variant="link" className="px-0" onClick={() => router.push(`/customers/${booking.customer?.id}/edit`)}>
                    View Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No customer profile linked.</p>
                  <Button variant="outline">Link Customer</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {booking.status === 'confirmed' && (
                <Button className="w-full" onClick={() => router.push(`/front-desk/check-in/${booking.id}`)}>
                  Check In
                </Button>
              )}
              {booking.status === 'checked_in' && (
                <Button className="w-full" onClick={() => router.push(`/front-desk/check-out/${booking.id}`)}>
                  Check Out
                </Button>
              )}
              {(booking.status === 'draft' || booking.status === 'confirmed') && (
                <Button variant="destructive" className="w-full">
                  Cancel Booking
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
