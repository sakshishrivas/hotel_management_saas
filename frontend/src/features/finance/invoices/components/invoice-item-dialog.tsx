'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceItemSchema, InvoiceItemFormValues } from '../schema';
import { useAddInvoiceItem, useUpdateInvoiceItem } from '../hooks/use-invoices';
import { InvoiceItem } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InvoiceItemDialogProps {
  invoiceId: string;
  initialData?: InvoiceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceItemDialog({ invoiceId, initialData, open, onOpenChange }: InvoiceItemDialogProps) {
  const addMutation = useAddInvoiceItem();
  const updateMutation = useUpdateInvoiceItem();

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceItemSchema),
    defaultValues: {
      itemType: initialData?.itemType || 'Service',
      description: initialData?.description || '',
      quantity: initialData?.quantity || 1,
      unitPrice: initialData?.unitPrice || 0,
      taxAmount: initialData?.taxAmount || 0,
      discountAmount: initialData?.discountAmount || 0,
    },
  });

  const onSubmit = async (data: InvoiceItemFormValues) => {
    if (isEditing && initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, invoiceId, data });
    } else {
      await addMutation.mutateAsync({ invoiceId, data });
    }
    onOpenChange(false);
    if (!isEditing) reset();
  };

  const isLoading = addMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add Item'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Input {...register('description')} />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message as string}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Item Type</Label>
              <Input {...register('itemType')} placeholder="Room, F&B, Service" />
              {errors.itemType && <p className="text-sm text-red-500">{errors.itemType.message as string}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" {...register('quantity', { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label>Unit Price</Label>
              <Input type="number" step="0.01" {...register('unitPrice', { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label>Tax Amount</Label>
              <Input type="number" step="0.01" {...register('taxAmount', { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label>Discount Amount</Label>
              <Input type="number" step="0.01" {...register('discountAmount', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
