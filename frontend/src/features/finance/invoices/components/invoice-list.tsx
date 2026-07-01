'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Printer, MoreHorizontal } from 'lucide-react';
import { useInvoices } from '../hooks/use-invoices';
import { Invoice } from '../types';
import { DataTable, Column } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function InvoiceList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading } = useInvoices({ page, limit });

  const columns: Column<Invoice>[] = [
    {
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      className: 'font-medium',
    },
    {
      header: 'Issue Date',
      cell: (invoice) => new Date(invoice.issueDate).toLocaleDateString(),
    },
    {
      header: 'Booking Ref',
      cell: (invoice) => invoice.booking?.bookingReference || 'Unknown',
    },
    {
      header: 'Amount',
      cell: (invoice) => `${invoice.grandTotal} ${invoice.currencyCode}`,
    },
    {
      header: 'Outstanding',
      cell: (invoice) => (
        <span className={invoice.outstandingAmount > 0 ? 'text-red-500 font-medium' : 'text-green-500'}>
          {invoice.outstandingAmount} {invoice.currencyCode}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (invoice) => (
        <StatusBadge status={invoice.status} />
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (invoice) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" />
              }
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/finance/invoices/${invoice.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/finance/invoices/${invoice.id}/print`, '_blank')}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      isLoading={isLoading}
      emptyStateTitle="No invoices found"
      emptyStateDescription="Invoices are generated from bookings."
      pagination={data?.meta ? {
        page: data.meta.page,
        limit: data.meta.limit,
        total: data.meta.total,
        onPageChange: setPage,
      } : undefined}
    />
  );
}
