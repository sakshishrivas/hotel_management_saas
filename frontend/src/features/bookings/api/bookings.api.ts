import { apiClient } from '@/lib/api/axios';
import { Booking, PaginatedResponse, SingleResponse } from '../types';
import { BookingFormValues, CancelBookingFormValues } from '../schema';

export const bookingsApi = {
  getBookings: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Booking>>('/bookings', { params });
    return response.data;
  },

  getBooking: async (id: string) => {
    const response = await apiClient.get<SingleResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  },

  createBooking: async (data: BookingFormValues) => {
    const response = await apiClient.post<SingleResponse<Booking>>('/bookings', data);
    return response.data;
  },

  updateBooking: async (id: string, data: Partial<BookingFormValues>) => {
    const response = await apiClient.patch<SingleResponse<Booking>>(`/bookings/${id}`, data);
    return response.data;
  },

  cancelBooking: async (id: string, data: CancelBookingFormValues) => {
    const response = await apiClient.post<SingleResponse<Booking>>(`/bookings/${id}/cancel`, data);
    return response.data;
  },
};
