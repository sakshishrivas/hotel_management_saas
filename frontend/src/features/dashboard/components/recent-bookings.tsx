import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface RecentBookingsProps {
  bookings: any[];
  isLoading?: boolean;
}

export function RecentBookings({ bookings, isLoading }: RecentBookingsProps) {
  if (isLoading) {
    return <div>Loading bookings...</div>;
  }

  if (!bookings || bookings.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No recent bookings found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ref</TableHead>
          <TableHead>Check In</TableHead>
          <TableHead>Check Out</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell className="font-medium">{booking.bookingRef}</TableCell>
            <TableCell>{format(new Date(booking.checkInDate), 'MMM d, yyyy')}</TableCell>
            <TableCell>{format(new Date(booking.checkOutDate), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                {booking.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">${Number(booking.totalPrice).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
