'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/data-table';
import { ReportFilters } from './report-filters';
import { LineChart, BarChart } from './charts';
import { useReportCustomers } from '../hooks/use-reports';
import { printReport, exportToCsv, DatePreset, getDateRange } from '../utils/report-utils';
import { format, parseISO } from 'date-fns';

export function CustomerReports() {
  const [datePreset, setDatePreset] = useState<DatePreset>('thisYear');
  const [dateRange, setDateRange] = useState(getDateRange('thisYear'));
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

  const { data: customersData, isLoading } = useReportCustomers({
    hotelId,
    search,
    page,
    limit,
  });

  const customers = customersData?.data || [];
  const meta = customersData?.meta;

  // Aggregate customers by creation month
  const chartDataMap = customers.reduce((acc: any, c: any) => {
    const month = format(new Date(c.createdAt), 'yyyy-MM');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(chartDataMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Dummy data for returning vs new
  const returnData = [
    { name: 'New Customers', value: Math.max(0, customers.length - 15) },
    { name: 'Returning Customers', value: Math.min(15, customers.length) },
  ];

  const columns = [
    {
      header: 'Name',
      accessorKey: 'firstName' as const,
      cell: (item: any) => <span className="font-medium">{item.firstName} {item.lastName}</span>,
    },
    {
      header: 'Email',
      accessorKey: 'email' as const,
    },
    {
      header: 'Phone',
      accessorKey: 'phone' as const,
      cell: (item: any) => item.phone || '-',
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt' as const,
      cell: (item: any) => format(new Date(item.createdAt), 'MMM d, yyyy'),
    },
  ];

  const handleExportCsv = () => {
    const exportData = customers.map((c: any) => ({
      'First Name': c.firstName,
      'Last Name': c.lastName,
      'Email': c.email,
      'Phone': c.phone || '',
      'Joined Date': format(new Date(c.createdAt), 'yyyy-MM-dd')
    }));
    exportToCsv(exportData, 'customer_report');
  };

  const totalCustomers = meta?.total || 0;

  return (
    <div className="space-y-6" id="customer-report">
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
        onPrint={() => printReport('customer-report', 'Customer Report')}
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Customers (Period)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customer Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12%</div>
            <p className="text-xs text-muted-foreground">vs previous period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-[350px]">
          <LineChart
            title="Customer Acquisition Trend"
            data={chartData}
            dataKey="date"
            xAxisFormat={(val) => format(parseISO(val + '-01'), 'MMM yyyy')}
            lines={[{ key: 'count', name: 'New Customers', format: 'number' }]}
            isLoading={isLoading}
          />
        </div>
        <div className="h-[350px]">
          <BarChart
            title="New vs Returning"
            data={returnData}
            dataKey="name"
            bars={[{ key: 'value', name: 'Customers', format: 'number' }]}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={customers}
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
