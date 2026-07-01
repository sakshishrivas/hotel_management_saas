import { apiClient } from '@/lib/api/axios';
import { Refund, PaginatedResponse, SingleResponse } from '../types';
import { ProcessRefundFormValues } from '../schema';

export const refundsApi = {
  getRefunds: async (params?: { page?: number; limit?: number; status?: string; paymentId?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Refund>>('/refunds', { params });
    return response.data;
  },

  getRefund: async (id: string) => {
    const response = await apiClient.get<SingleResponse<Refund>>(`/refunds/${id}`);
    return response.data;
  },

  processRefund: async (data: ProcessRefundFormValues) => {
    const response = await apiClient.post<SingleResponse<Refund>>('/refunds', data);
    return response.data;
  },

  updateRefundStatus: async (id: string, status: string) => {
    const response = await apiClient.patch<SingleResponse<Refund>>(`/refunds/${id}`, { status });
    return response.data;
  },
};
