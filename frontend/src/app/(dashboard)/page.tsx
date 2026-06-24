'use client';

import { DollarSign, Users, CalendarDays, BedDouble } from 'lucide-react';
import { useDashboardStats } from '@/features/dashboard/hooks/use-dashboard-stats';
import { StatCard } from '@/features/dashboard/components/stat-card';
import { RecentBookings } from '@/features/dashboard/components/recent-bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { revenue, activeBookingsCount, customersCount, recentBookings, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your hotel's performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue (This Month)"
          value={`$${revenue.toLocaleString()}`}
          icon={DollarSign}
          description="Payments captured this month"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Bookings"
          value={activeBookingsCount}
          icon={CalendarDays}
          description="Confirmed bookings"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Customers"
          value={customersCount}
          icon={Users}
          description="Registered guests"
          isLoading={isLoading}
        />
        <StatCard
          title="Occupancy Rate"
          value="75%" // Placeholder until room stats API is built
          icon={BedDouble}
          description="Rooms occupied today"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentBookings bookings={recentBookings} isLoading={isLoading} />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Pending Housekeeping</span>
              <span className="text-amber-600 font-bold">12 Rooms</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Check-outs Today</span>
              <span className="text-blue-600 font-bold">5 Guests</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Outstanding Invoices</span>
              <span className="text-red-600 font-bold">3 Invoices</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
