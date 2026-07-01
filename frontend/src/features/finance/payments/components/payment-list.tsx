'use client';

import { useState } from 'react';
import { usePayments } from '../hooks/use-payments';
import { Payment } from '../types';
import { DataTable, Column } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { PaymentAllocationDialog } from './payment-allocation-dialog';

export function PaymentList() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading } = usePayments({ page, limit });

  const [allocationPaymentId, setAllocationPaymentId] = useState<string | null>(null);

  const columns: Column<Payment>[] = [
    {
      header: 'ID',
      cell: (payment) => <span className="font-mono text-xs">{payment.id.split('-')[0]}...</span>,
    },
    {
      header: 'Date',
      cell: (payment) => new Date(payment.createdAt).toLocaleDateString(),
    },
    {
      header: 'Method',
      cell: (payment) => (
        <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
      ),
    },
    {
      header: 'Amount',
      cell: (payment) => (
        <span className="font-medium text-green-600">
          {payment.amount} {payment.currencyCode}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (payment) => <StatusBadge status={payment.status} />,
    },
    {
      header: 'Allocations',
      cell: (payment) => {
        const allocatedAmount = payment.allocations?.reduce((sum, a) => sum + a.amount, 0) || 0;
        const unallocated = payment.amount - allocatedAmount;
        
        if (payment.status !== 'completed') return <span className="text-muted-foreground text-xs">N/A</span>;
        
        return (
          <div className="flex items-center space-x-2 text-xs">
            {unallocated > 0 ? (
              <span className="text-amber-500 font-medium">Unallocated: {unallocated}</span>
            ) : (
              <span className="text-green-500">Fully allocated</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (payment) => {
        if (payment.status !== 'completed') return null;
        
        const allocatedAmount = payment.allocations?.reduce((sum, a) => sum + a.amount, 0) || 0;
        const unallocated = payment.amount - allocatedAmount;
        
        if (unallocated <= 0) return null;

        return (
          <Button variant="outline" size="sm" onClick={() => setAllocationPaymentId(payment.id)}>
            <Wallet className="mr-2 h-4 w-4" /> Allocate
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyStateTitle="No payments recorded"
        emptyStateDescription="Record payments received from guests."
        pagination={data?.meta ? {
          page: data.meta.page,
          limit: data.meta.limit,
          total: data.meta.total,
          onPageChange: setPage,
        } : undefined}
      />
      
      {allocationPaymentId && (
        <PaymentAllocationDialog
          paymentId={allocationPaymentId}
          open={!!allocationPaymentId}
          onOpenChange={(open) => !open && setAllocationPaymentId(null)}
        />
      )}
    </>
  );
}
