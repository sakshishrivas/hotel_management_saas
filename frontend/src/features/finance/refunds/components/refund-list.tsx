'use client';

import { useState } from 'react';
import { useRefunds } from '../hooks/use-refunds';
import { Refund } from '../types';
import { DataTable, Column } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';

export function RefundList() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading } = useRefunds({ page, limit });

  const columns: Column<Refund>[] = [
    {
      header: 'ID',
      cell: (refund) => <span className="font-mono text-xs">{refund.id.split('-')[0]}...</span>,
    },
    {
      header: 'Date',
      cell: (refund) => new Date(refund.createdAt).toLocaleDateString(),
    },
    {
      header: 'Payment Method',
      cell: (refund) => (
        <span className="capitalize">{refund.payment?.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
      ),
    },
    {
      header: 'Amount',
      cell: (refund) => (
        <span className="font-medium text-red-600">
          -{refund.amount} {refund.payment?.currencyCode || 'USD'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (refund) => <StatusBadge status={refund.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      isLoading={isLoading}
      emptyStateTitle="No refunds recorded"
      emptyStateDescription="Refunds issued against payments will appear here."
      pagination={data?.meta ? {
        page: data.meta.page,
        limit: data.meta.limit,
        total: data.meta.total,
        onPageChange: setPage,
      } : undefined}
    />
  );
}
