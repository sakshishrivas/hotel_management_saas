import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelsApi } from '../api/hotels.api';
import { HotelFormValues } from '../schema';
import { toast } from 'sonner';

export function useHotels(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['hotels', params],
    queryFn: () => hotelsApi.getHotels(params),
  });
}

export function useHotel(id: string) {
  return useQuery({
    queryKey: ['hotels', id],
    queryFn: () => hotelsApi.getHotel(id),
    enabled: !!id,
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HotelFormValues) => hotelsApi.createHotel(data),
    onSuccess: () => {
      toast.success('Hotel created successfully');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create hotel');
    },
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HotelFormValues }) => hotelsApi.updateHotel(id, data),
    onSuccess: (_, variables) => {
      toast.success('Hotel updated successfully');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotels', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update hotel');
    },
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hotelsApi.deleteHotel(id),
    onSuccess: () => {
      toast.success('Hotel deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete hotel');
    },
  });
}
