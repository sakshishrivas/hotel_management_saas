'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateInvoiceSchema, GenerateInvoiceFormValues } from '../schema';
import { useGenerateInvoice } from '../hooks/use-invoices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

export function GenerateInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const generateMutation = useGenerateInvoice();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generateInvoiceSchema),
    defaultValues: {
      bookingId: '',
      dueDate: '',
      notes: '',
    },
  });

  const onSubmit = async (data: GenerateInvoiceFormValues) => {
    await generateMutation.mutateAsync(data);
    setOpen(false);
    reset();
  };

  const isLoading = generateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <FileText className="mr-2 h-4 w-4" /> Generate Invoice
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
          <DialogDescription>
            Create an invoice for an existing booking. This will automatically pull in room charges.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookingId">Booking ID</Label>
            <Input id="bookingId" {...register('bookingId')} placeholder="UUID of the booking" />
            {errors.bookingId && <p className="text-sm text-red-500">{errors.bookingId.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input id="dueDate" type="date" {...register('dueDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
