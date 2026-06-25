import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings.api';
import { BookingFormValues, CancelBookingFormValues } from '../schema';
import { toast } from 'sonner';

export function useBookings(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingsApi.getBookings(params),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingsApi.getBooking(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingFormValues) => bookingsApi.createBooking(data),
    onSuccess: () => {
      toast.success('Booking created successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create booking');
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BookingFormValues> }) => bookingsApi.updateBooking(id, data),
    onSuccess: (_, variables) => {
      toast.success('Booking updated successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update booking');
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelBookingFormValues }) => bookingsApi.cancelBooking(id, data),
    onSuccess: (_, variables) => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to cancel booking');
    },
  });
}
