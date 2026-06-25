import { apiClient } from '@/lib/api/axios';
import { BookingGuest, PaginatedResponse, SingleResponse } from '@/features/bookings/types';

export interface BookingGuestFormValues {
  bookingRoomId: string;
  guestType?: string;
  fullName: string;
  email?: string;
  phone?: string;
  documentType?: string;
  documentNo?: string;
  isPrimary?: boolean;
  dateOfBirth?: string;
  nationality?: string;
  notes?: string;
}

export const bookingGuestsApi = {
  getBookingGuests: async (params?: { page?: number; limit?: number; bookingRoomId?: string }) => {
    const response = await apiClient.get<PaginatedResponse<BookingGuest>>('/booking-guests', { params });
    return response.data;
  },

  createGuest: async (data: BookingGuestFormValues) => {
    const response = await apiClient.post<SingleResponse<BookingGuest>>('/booking-guests', data);
    return response.data;
  },

  updateGuest: async (id: string, data: Partial<BookingGuestFormValues>) => {
    const response = await apiClient.patch<SingleResponse<BookingGuest>>(`/booking-guests/${id}`, data);
    return response.data;
  },

  deleteGuest: async (id: string) => {
    const response = await apiClient.delete(`/booking-guests/${id}`);
    return response.data;
  },
};
