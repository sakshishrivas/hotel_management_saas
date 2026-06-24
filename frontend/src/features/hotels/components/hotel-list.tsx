'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useHotels, useDeleteHotel } from '../hooks/use-hotels';
import { Hotel } from '../types';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function HotelList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading } = useHotels({ page, limit });
  const deleteMutation = useDeleteHotel();
  
  const [hotelToDelete, setHotelToDelete] = useState<string | null>(null);

  const columns: Column<Hotel>[] = [
    {
      header: 'Code',
      accessorKey: 'hotelCode',
      className: 'font-medium',
    },
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'City',
      accessorKey: 'city',
    },
    {
      header: 'Country',
      accessorKey: 'countryCode',
    },
    {
      header: 'Status',
      cell: (hotel) => (
        <StatusBadge status={hotel.isActive ? 'active' : 'inactive'} />
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (hotel) => {
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
              <DropdownMenuItem onClick={() => router.push(`/hotels/${hotel.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setHotelToDelete(hotel.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        emptyStateTitle="No hotels found"
        emptyStateDescription="You haven't added any hotels yet. Create one to get started."
        pagination={data?.meta ? {
          page: data.meta.page,
          limit: data.meta.limit,
          total: data.meta.total,
          onPageChange: setPage,
        } : undefined}
      />

      <AlertDialog open={!!hotelToDelete} onOpenChange={(open) => !open && setHotelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hotel
              and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (hotelToDelete) {
                  deleteMutation.mutate(hotelToDelete);
                  setHotelToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
