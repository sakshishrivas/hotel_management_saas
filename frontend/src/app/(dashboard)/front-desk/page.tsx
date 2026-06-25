import { PageHeader } from '@/components/shared/page-header';
import { BookingList } from '@/features/bookings/components/booking-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FrontDeskPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Front Desk"
        description="Manage arrivals, departures, and in-house guests."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Arrivals</CardTitle>
            <CardDescription>Guests arriving today</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">Select a confirmed booking from the list below and click 'Check In' from the details page.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Departures</CardTitle>
            <CardDescription>Guests departing today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Select an in-house booking from the list below and click 'Check Out' from the details page.</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">All Recent Bookings</h3>
        <BookingList />
      </div>
    </div>
  );
}
