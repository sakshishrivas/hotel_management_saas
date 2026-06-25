import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingGuestsApi, BookingGuestFormValues } from '../api/booking-guests.api';
import { toast } from 'sonner';

export function useBookingGuests(params?: { page?: number; limit?: number; bookingRoomId?: string }) {
  return useQuery({
    queryKey: ['booking-guests', params],
    queryFn: () => bookingGuestsApi.getBookingGuests(params),
    enabled: !!params?.bookingRoomId,
  });
}

export function useCreateBookingGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingGuestFormValues) => bookingGuestsApi.createGuest(data),
    onSuccess: () => {
      toast.success('Guest added successfully');
      queryClient.invalidateQueries({ queryKey: ['booking-guests'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] }); // refresh booking details
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to add guest');
    },
  });
}

export function useUpdateBookingGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BookingGuestFormValues> }) => bookingGuestsApi.updateGuest(id, data),
    onSuccess: () => {
      toast.success('Guest updated successfully');
      queryClient.invalidateQueries({ queryKey: ['booking-guests'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update guest');
    },
  });
}

export function useDeleteBookingGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingGuestsApi.deleteGuest(id),
    onSuccess: () => {
      toast.success('Guest removed successfully');
      queryClient.invalidateQueries({ queryKey: ['booking-guests'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to remove guest');
    },
  });
}
