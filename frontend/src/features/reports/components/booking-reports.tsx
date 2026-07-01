'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ReportFilters } from './report-filters';
import { LineChart, PieChart } from './charts';
import { useReportBookings } from '../hooks/use-reports';
import { getDateRange, DatePreset, printReport, exportToCsv, computeAverageStay } from '../utils/report-utils';
import { format, parseISO } from 'date-fns';

export function BookingReports() {
  const [datePreset, setDatePreset] = useState<DatePreset>('30days');
  const [dateRange, setDateRange] = useState(getDateRange('30days'));
  const [hotelId, setHotelId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      setDateRange(getDateRange(preset));
    }
  };

  const { data: bookingsData, isLoading } = useReportBookings({
    hotelId,
    search,
    page,
    limit,
  });

  const bookings = bookingsData?.data || [];
  const meta = bookingsData?.meta;

  // Simple aggregation for chart (current page only for demo purposes)
  const chartData = Object.entries(
    bookings.reduce((acc: any, b: any) => {
      const date = format(new Date(b.createdAt), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

  const statusData = Object.entries(
    bookings.reduce((acc: any, b: any) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace('_', ' ').toUpperCase(), value }));

  const columns = [
    {
      header: 'Ref',
      accessorKey: 'bookingReference' as const,
      cell: (item: any) => <span className="font-medium">{item.bookingReference || item.bookingRef}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'customer' as const,
      cell: (item: any) => (
        <div>
          <div className="font-medium">{item.customer?.firstName} {item.customer?.lastName}</div>
          <div className="text-xs text-muted-foreground">{item.customer?.email}</div>
        </div>
      ),
    },
    {
      header: 'Check In',
      accessorKey: 'checkInDate' as const,
      cell: (item: any) => format(new Date(item.checkInDate), 'MMM d, yyyy'),
    },
    {
      header: 'Check Out',
      accessorKey: 'checkOutDate' as const,
      cell: (item: any) => format(new Date(item.checkOutDate), 'MMM d, yyyy'),
    },
    {
      header: 'Status',
      accessorKey: 'status' as const,
      cell: (item: any) => <StatusBadge status={item.status} />,
    },
  ];

  const handleExportCsv = () => {
    const exportData = bookings.map((b: any) => ({
      Reference: b.bookingReference || b.bookingRef,
      Customer: `${b.customer?.firstName} ${b.customer?.lastName}`,
      'Check In': format(new Date(b.checkInDate), 'yyyy-MM-dd'),
      'Check Out': format(new Date(b.checkOutDate), 'yyyy-MM-dd'),
      Status: b.status,
      Channel: b.sourceChannel,
      'Total Price': b.totalPrice || b.totalAmount || 0,
      Currency: b.currencyCode
    }));
    exportToCsv(exportData, 'booking_report');
  };

  const avgStay = computeAverageStay(bookings);

  return (
    <div className="space-y-6" id="booking-report">
      <ReportFilters
        datePreset={datePreset}
        onDatePresetChange={handleDatePresetChange}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onStartDateChange={(d) => setDateRange((prev) => ({ ...prev, startDate: d }))}
        onEndDateChange={(d) => setDateRange((prev) => ({ ...prev, endDate: d }))}
        hotelId={hotelId}
        onHotelChange={setHotelId}
        search={search}
        onSearchChange={setSearch}
        showSearch={true}
        onExportCsv={handleExportCsv}
        onPrint={() => printReport('booking-report', 'Booking Report')}
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings (Period)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meta?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Stay Length</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgStay.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">days</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancellation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.length ? ((bookings.filter(b => b.status === 'cancelled').length / bookings.length) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-[350px]">
          <LineChart
            title="Booking Trend"
            data={chartData}
            dataKey="date"
            xAxisFormat={(val) => format(parseISO(val), 'MMM d')}
            lines={[{ key: 'count', name: 'Bookings', format: 'number' }]}
            isLoading={isLoading}
          />
        </div>
        <div className="h-[350px]">
          <PieChart
            title="Booking Status"
            data={statusData}
            dataKey="value"
            nameKey="name"
            format="number"
            isLoading={isLoading}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={bookings}
            isLoading={isLoading}
            pagination={meta ? {
              page: meta.page,
              limit: meta.limit,
              total: meta.total,
              onPageChange: setPage,
            } : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
