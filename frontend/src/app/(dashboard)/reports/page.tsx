'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardAnalytics } from '@/features/reports/components/dashboard-analytics';
import { RevenueReports } from '@/features/reports/components/revenue-reports';
import { BookingReports } from '@/features/reports/components/booking-reports';
import { OccupancyReports } from '@/features/reports/components/occupancy-reports';
import { CustomerReports } from '@/features/reports/components/customer-reports';
import { FinancialReports } from '@/features/reports/components/financial-reports';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive analytics and financial reports for your hotel."
      />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4 overflow-x-auto inline-flex h-auto p-1 max-w-full">
          <TabsTrigger value="dashboard" className="px-4 py-2">Dashboard</TabsTrigger>
          <TabsTrigger value="revenue" className="px-4 py-2">Revenue</TabsTrigger>
          <TabsTrigger value="bookings" className="px-4 py-2">Bookings</TabsTrigger>
          <TabsTrigger value="occupancy" className="px-4 py-2">Occupancy</TabsTrigger>
          <TabsTrigger value="customers" className="px-4 py-2">Customers</TabsTrigger>
          <TabsTrigger value="finance" className="px-4 py-2">Financial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4 outline-none">
          <DashboardAnalytics />
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4 outline-none">
          <RevenueReports />
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-4 outline-none">
          <BookingReports />
        </TabsContent>
        
        <TabsContent value="occupancy" className="space-y-4 outline-none">
          <OccupancyReports />
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4 outline-none">
          <CustomerReports />
        </TabsContent>
        
        <TabsContent value="finance" className="space-y-4 outline-none">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
