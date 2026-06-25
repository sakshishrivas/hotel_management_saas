'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useCustomers, useDeleteCustomer } from '../hooks/use-customers';
import { Customer } from '../types';
import { DataTable, Column } from '@/components/shared/data-table';
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

export function CustomerList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading } = useCustomers({ page, limit });
  const deleteMutation = useDeleteCustomer();
  
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const columns: Column<Customer>[] = [
    {
      header: 'Name',
      cell: (customer) => (
        <div className="font-medium">
          {customer.firstName} {customer.lastName}
        </div>
      ),
    },
    {
      header: 'Nationality',
      accessorKey: 'nationality',
    },
    {
      header: 'Document',
      cell: (customer) => (
        <div>
          {customer.documentType ? `${customer.documentType}: ${customer.documentNo}` : 'N/A'}
        </div>
      ),
    },
    {
      header: 'City/Country',
      cell: (customer) => (
        <div>
          {customer.city ? `${customer.city}, ` : ''}{customer.countryCode || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (customer) => {
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
              <DropdownMenuItem onClick={() => router.push(`/customers/${customer.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setCustomerToDelete(customer.id)}
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
        emptyStateTitle="No customers found"
        emptyStateDescription="You haven't added any customers yet. Create one to get started."
        pagination={data?.meta ? {
          page: data.meta.page,
          limit: data.meta.limit,
          total: data.meta.total,
          onPageChange: setPage,
        } : undefined}
      />

      <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              and all of their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (customerToDelete) {
                  deleteMutation.mutate(customerToDelete);
                  setCustomerToDelete(null);
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
