'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { checkInSchema, CheckInFormValues } from '../schema';
import { useCheckIn } from '../hooks/use-front-desk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CheckInFormProps {
  bookingId: string;
}

export function CheckInForm({ bookingId }: CheckInFormProps) {
  const router = useRouter();
  const checkInMutation = useCheckIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      depositAmount: 0,
      remarks: '',
    },
  });

  const onSubmit = async (data: CheckInFormValues) => {
    await checkInMutation.mutateAsync({
      bookingId,
      depositAmount: data.depositAmount,
      remarks: data.remarks,
    });
    router.push(`/bookings/${bookingId}`);
  };

  const isLoading = checkInMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="depositAmount">Deposit Amount Collected</Label>
        <Input id="depositAmount" type="number" step="0.01" {...register('depositAmount')} />
        {errors.depositAmount && <p className="text-sm text-red-500">{errors.depositAmount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Check-In Remarks (Optional)</Label>
        <Textarea id="remarks" {...register('remarks')} rows={4} />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Complete Check-In'}
        </Button>
      </div>
    </form>
  );
}
