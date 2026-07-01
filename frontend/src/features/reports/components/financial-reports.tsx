'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ReportFilters } from './report-filters';
import { PieChart, BarChart } from './charts';
import { useOutstandingInvoices } from '../hooks/use-reports';
import { printReport, exportToCsv, formatCurrency } from '../utils/report-utils';
import { format } from 'date-fns';

export function FinancialReports() {
  const [hotelId, setHotelId] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: invoicesData, isLoading } = useOutstandingInvoices({
    hotelId,
    page,
    limit,
  });

  const invoices = invoicesData?.items || [];
  const meta = invoicesData?.meta;
  const summary = invoicesData?.summary;

  // Chart data
  const statusData = [
    { name: 'Overdue', value: invoices.filter((i: any) => new Date(i.dueDate || '') < new Date()).length },
    { name: 'Pending', value: invoices.filter((i: any) => new Date(i.dueDate || '') >= new Date()).length },
  ];

  const amountData = invoices.map((i: any) => ({
    name: i.invoiceNumber,
    value: i.balanceDue
  })).slice(0, 10); // Top 10

  const columns = [
    {
      header: 'Invoice',
      accessorKey: 'invoiceNumber' as const,
      cell: (item: any) => <span className="font-medium">{item.invoiceNumber}</span>,
    },
    {
      header: 'Booking Ref',
      accessorKey: 'booking' as const,
      cell: (item: any) => item.booking?.bookingRef || '-',
    },
    {
      header: 'Date',
      accessorKey: 'invoiceDate' as const,
      cell: (item: any) => item.invoiceDate ? format(new Date(item.invoiceDate), 'MMM d, yyyy') : '-',
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate' as const,
      cell: (item: any) => {
        if (!item.dueDate) return '-';
        const isOverdue = new Date(item.dueDate) < new Date();
        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {format(new Date(item.dueDate), 'MMM d, yyyy')}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status' as const,
      cell: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Total',
      accessorKey: 'totalAmount' as const,
      cell: (item: any) => formatCurrency(item.totalAmount, item.currencyCode),
      className: 'text-right',
    },
    {
      header: 'Balance',
      accessorKey: 'balanceDue' as const,
      cell: (item: any) => (
        <span className="font-medium">
          {formatCurrency(item.balanceDue, item.currencyCode)}
        </span>
      ),
      className: 'text-right',
    },
  ];

  const handleExportCsv = () => {
    const exportData = invoices.map((i: any) => ({
      'Invoice Number': i.invoiceNumber,
      'Booking Ref': i.booking?.bookingRef || '',
      'Invoice Date': i.invoiceDate ? format(new Date(i.invoiceDate), 'yyyy-MM-dd') : '',
      'Due Date': i.dueDate ? format(new Date(i.dueDate), 'yyyy-MM-dd') : '',
      'Status': i.status,
      'Total Amount': i.totalAmount,
      'Paid Amount': i.paidAmount,
      'Balance Due': i.balanceDue,
      'Currency': i.currencyCode
    }));
    exportToCsv(exportData, 'financial_report_outstanding_invoices');
  };

  return (
    <div className="space-y-6" id="financial-report">
      <ReportFilters
        datePreset="thisMonth"
        onDatePresetChange={() => {}}
        showDateFilter={false} // Outstanding is point in time
        hotelId={hotelId}
        onHotelChange={setHotelId}
        showSearch={false}
        onExportCsv={handleExportCsv}
        onPrint={() => printReport('financial-report', 'Financial Report - Outstanding Invoices')}
      />

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(summary?.totalOutstandingAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across {meta?.total || 0} unpaid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Invoice Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(
                (summary?.totalOutstandingAmount || 0) / (meta?.total || 1)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-[350px]">
          <PieChart
            title="Invoice Status (Outstanding)"
            data={statusData}
            dataKey="value"
            nameKey="name"
            format="number"
            isLoading={isLoading}
          />
        </div>
        <div className="h-[350px]">
          <BarChart
            title="Top 10 Outstanding Invoices"
            data={amountData}
            dataKey="name"
            bars={[{ key: 'value', name: 'Balance Due', format: 'currency' }]}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={invoices}
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
