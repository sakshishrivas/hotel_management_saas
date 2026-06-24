import { apiClient } from '@/lib/api/axios';
import { Hotel, PaginatedResponse, SingleResponse } from '../types';
import { HotelFormValues } from '../schema';

export const hotelsApi = {
  getHotels: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Hotel>>('/hotels', { params });
    return response.data;
  },

  getHotel: async (id: string) => {
    const response = await apiClient.get<SingleResponse<Hotel>>(`/hotels/${id}`);
    return response.data;
  },

  createHotel: async (data: HotelFormValues) => {
    const response = await apiClient.post<SingleResponse<Hotel>>('/hotels', data);
    return response.data;
  },

  updateHotel: async (id: string, data: HotelFormValues) => {
    const response = await apiClient.patch<SingleResponse<Hotel>>(`/hotels/${id}`, data);
    return response.data;
  },

  deleteHotel: async (id: string) => {
    const response = await apiClient.delete(`/hotels/${id}`);
    return response.data;
  },
};
