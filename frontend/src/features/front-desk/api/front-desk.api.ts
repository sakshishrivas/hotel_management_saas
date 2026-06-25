import { apiClient } from '@/lib/api/axios';

export const frontDeskApi = {
  checkIn: async (data: { bookingId: string; depositAmount?: number; remarks?: string }) => {
    const response = await apiClient.post('/check-in', data);
    return response.data;
  },

  checkOut: async (data: { bookingId: string; finalInspectionStatus?: string; remarks?: string }) => {
    const response = await apiClient.post('/check-out', data);
    return response.data;
  },
};
