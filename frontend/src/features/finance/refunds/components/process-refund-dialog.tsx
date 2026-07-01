'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { processRefundSchema, ProcessRefundFormValues } from '../schema';
import { useProcessRefund } from '../hooks/use-refunds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Undo } from 'lucide-react';

export function ProcessRefundDialog() {
  const [open, setOpen] = useState(false);
  const processMutation = useProcessRefund();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(processRefundSchema),
    defaultValues: {
      paymentId: '',
      amount: 0,
      reason: '',
    },
  });

  const onSubmit = async (data: ProcessRefundFormValues) => {
    await processMutation.mutateAsync(data);
    setOpen(false);
    reset();
  };

  const isLoading = processMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Undo className="mr-2 h-4 w-4" /> Process Refund
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Issue a refund for an existing payment. Ensure the payment ID is valid.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentId">Payment ID</Label>
            <Input id="paymentId" {...register('paymentId')} placeholder="UUID of the original payment" />
            {errors.paymentId && <p className="text-sm text-red-500">{errors.paymentId.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Refund</Label>
            <Input id="amount" type="number" step="0.01" {...register('amount')} />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea id="reason" {...register('reason')} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Issue Refund'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
