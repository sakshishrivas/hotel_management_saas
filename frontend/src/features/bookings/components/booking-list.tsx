'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import { useBookings } from '../hooks/use-bookings';
import { Booking } from '../types';
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

export function BookingList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading } = useBookings({ page, limit });

  const columns: Column<Booking>[] = [
    {
      header: 'Reference',
      accessorKey: 'bookingReference',
      className: 'font-medium',
    },
    {
      header: 'Guest Name',
      cell: (booking) => (
        <div>
          {booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'Walk-in / Unknown'}
        </div>
      ),
    },
    {
      header: 'Dates',
      cell: (booking) => (
        <div className="text-sm">
          <div>In: {new Date(booking.checkInDate).toLocaleDateString()}</div>
          <div>Out: {new Date(booking.checkOutDate).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      header: 'Total',
      cell: (booking) => (
        <div>
          {booking.totalAmount} {booking.currencyCode}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (booking) => (
        <StatusBadge status={booking.status} />
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (booking) => {
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
              <DropdownMenuItem onClick={() => router.push(`/bookings/${booking.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
                <DropdownMenuItem onClick={() => router.push(`/bookings/${booking.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
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
      emptyStateTitle="No bookings found"
      emptyStateDescription="You haven't added any bookings yet. Create one to get started."
      pagination={data?.meta ? {
        page: data.meta.page,
        limit: data.meta.limit,
        total: data.meta.total,
        onPageChange: setPage,
      } : undefined}
    />
  );
}
