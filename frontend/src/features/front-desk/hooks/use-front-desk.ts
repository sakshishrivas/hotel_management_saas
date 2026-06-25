import { useMutation, useQueryClient } from '@tanstack/react-query';
import { frontDeskApi } from '../api/front-desk.api';
import { toast } from 'sonner';

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { bookingId: string; depositAmount?: number; remarks?: string }) => frontDeskApi.checkIn(data),
    onSuccess: () => {
      toast.success('Check-in completed successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Check-in failed');
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { bookingId: string; finalInspectionStatus?: string; remarks?: string }) => frontDeskApi.checkOut(data),
    onSuccess: () => {
      toast.success('Check-out completed successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Check-out failed');
    },
  });
}
