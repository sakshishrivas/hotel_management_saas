'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { recordPaymentSchema, RecordPaymentFormValues } from '../schema';
import { useCreatePayment } from '../hooks/use-payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RecordPaymentForm() {
  const router = useRouter();
  const createMutation = useCreatePayment();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      bookingId: '',
      invoiceId: '',
      paymentMethod: 'credit_card',
      amount: 0,
      currencyCode: 'USD',
      gatewayTransactionId: '',
      notes: '',
    },
  });

  const paymentMethod = watch('paymentMethod');

  const onSubmit = async (data: RecordPaymentFormValues) => {
    // If invoiceId is empty string, make it undefined
    const payload = {
      ...data,
      invoiceId: data.invoiceId || undefined,
    };

    await createMutation.mutateAsync(payload);
    router.push('/finance/payments');
  };

  const isLoading = createMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bookingId">Booking ID <span className="text-red-500">*</span></Label>
          <Input id="bookingId" {...register('bookingId')} placeholder="UUID of the booking" />
          {errors.bookingId && <p className="text-sm text-red-500">{errors.bookingId.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceId">Invoice ID (Optional)</Label>
          <Input id="invoiceId" {...register('invoiceId')} placeholder="Directly allocate to invoice" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
          <Input id="amount" type="number" step="0.01" {...register('amount')} />
          {errors.amount && <p className="text-sm text-red-500">{errors.amount.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currencyCode">Currency</Label>
          <Input id="currencyCode" {...register('currencyCode')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method <span className="text-red-500">*</span></Label>
          <Select
            value={paymentMethod}
            onValueChange={(val) => {
              if (val !== null) {
                setValue('paymentMethod', val);
              }
            }}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="debit_card">Debit Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gatewayTransactionId">Transaction ID / Ref</Label>
          <Input id="gatewayTransactionId" {...register('gatewayTransactionId')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} rows={3} />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/finance/payments')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
}
