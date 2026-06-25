'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { checkOutSchema, CheckOutFormValues } from '../schema';
import { useCheckOut } from '../hooks/use-front-desk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CheckOutFormProps {
  bookingId: string;
}

export function CheckOutForm({ bookingId }: CheckOutFormProps) {
  const router = useRouter();
  const checkOutMutation = useCheckOut();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkOutSchema),
    defaultValues: {
      finalInspectionStatus: 'passed',
      remarks: '',
    },
  });

  const onSubmit = async (data: CheckOutFormValues) => {
    await checkOutMutation.mutateAsync({
      bookingId,
      finalInspectionStatus: data.finalInspectionStatus,
      remarks: data.remarks,
    });
    router.push(`/bookings/${bookingId}`);
  };

  const isLoading = checkOutMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="finalInspectionStatus">Final Room Inspection Status</Label>
        <Input id="finalInspectionStatus" {...register('finalInspectionStatus')} placeholder="e.g., Passed, Minor Issues" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Check-Out Remarks (Optional)</Label>
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
          {isLoading ? 'Processing...' : 'Complete Check-Out'}
        </Button>
      </div>
    </form>
  );
}
