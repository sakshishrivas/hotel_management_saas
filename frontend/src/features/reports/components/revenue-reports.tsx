'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/data-table';
import { ReportFilters } from './report-filters';
import { BarChart, AreaChart } from './charts';
import { usePaymentHistory } from '../hooks/use-reports';
import { getDateRange, formatCurrency, DatePreset, printReport, exportToCsv } from '../utils/report-utils';
import { format, parseISO } from 'date-fns';

export function RevenueReports() {
  const [datePreset, setDatePreset] = useState<DatePreset>('thisMonth');
  const [dateRange, setDateRange] = useState(getDateRange('thisMonth'));
  const [hotelId, setHotelId] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      setDateRange(getDateRange(preset));
    }
  };

  const { data: paymentsData, isLoading } = usePaymentHistory({
    ...dateRange,
    hotelId,
    page,
    limit,
  });

  const payments = paymentsData?.items || [];
  const meta = paymentsData?.meta;

  // Group payments by date for chart (simple client-side aggregation for the current page)
  const chartData = Object.entries(
    payments.reduce((acc: any, p: any) => {
      const date = format(new Date(p.createdAt), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));

  const columns = [
    {
      header: 'Date',
      accessorKey: 'createdAt' as const,
      cell: (item: any) => format(new Date(item.createdAt), 'MMM d, yyyy HH:mm'),
    },
    {
      header: 'Payment Method',
      accessorKey: 'paymentMethod' as const,
      cell: (item: any) => <span className="capitalize">{item.paymentMethod.replace('_', ' ')}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status' as const,
      cell: (item: any) => <span className="capitalize">{item.status}</span>,
    },
    {
      header: 'Amount',
      accessorKey: 'amount' as const,
      cell: (item: any) => formatCurrency(item.amount, item.currencyCode),
      className: 'text-right',
    },
  ];

  const handleExportCsv = () => {
    const exportData = payments.map((p: any) => ({
      Date: format(new Date(p.createdAt), 'yyyy-MM-dd HH:mm'),
      'Payment Method': p.paymentMethod,
      Status: p.status,
      Amount: p.amount,
      Currency: p.currencyCode,
      'Transaction ID': p.gatewayTransactionId || 'N/A'
    }));
    exportToCsv(exportData, 'revenue_report');
  };

  return (
    <div className="space-y-6" id="revenue-report">
      <ReportFilters
        datePreset={datePreset}
        onDatePresetChange={handleDatePresetChange}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onStartDateChange={(d) => setDateRange((prev) => ({ ...prev, startDate: d }))}
        onEndDateChange={(d) => setDateRange((prev) => ({ ...prev, endDate: d }))}
        hotelId={hotelId}
        onHotelChange={setHotelId}
        onExportCsv={handleExportCsv}
        onPrint={() => printReport('revenue-report', 'Revenue Report')}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-[350px]">
          <AreaChart
            title="Revenue Trend"
            data={chartData}
            dataKey="date"
            xAxisFormat={(val) => format(parseISO(val), 'MMM d')}
            lines={[{ key: 'revenue', name: 'Revenue', format: 'currency' }]}
            isLoading={isLoading}
          />
        </div>
        <div className="h-[350px]">
          <BarChart
            title="Daily Revenue"
            data={chartData}
            dataKey="date"
            xAxisFormat={(val) => format(parseISO(val), 'MMM d')}
            bars={[{ key: 'revenue', name: 'Revenue', format: 'currency' }]}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={payments}
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
