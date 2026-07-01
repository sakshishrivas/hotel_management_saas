'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { allocatePaymentSchema, AllocatePaymentFormValues } from '../schema';
import { useAllocatePayment } from '../hooks/use-payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PaymentAllocationDialogProps {
  paymentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentAllocationDialog({ paymentId, open, onOpenChange }: PaymentAllocationDialogProps) {
  const allocateMutation = useAllocatePayment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(allocatePaymentSchema),
    defaultValues: {
      invoiceId: '',
      amount: 0,
    },
  });

  const onSubmit = async (data: AllocatePaymentFormValues) => {
    await allocateMutation.mutateAsync({ paymentId, data });
    onOpenChange(false);
    reset();
  };

  const isLoading = allocateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Allocate Payment to Invoice</DialogTitle>
          <DialogDescription>
            Distribute funds from this payment towards an outstanding invoice balance.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceId">Invoice ID</Label>
            <Input id="invoiceId" {...register('invoiceId')} placeholder="UUID of the invoice" />
            {errors.invoiceId && <p className="text-sm text-red-500">{errors.invoiceId.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Allocate</Label>
            <Input id="amount" type="number" step="0.01" {...register('amount')} />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message as string}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Allocating...' : 'Allocate Funds'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
