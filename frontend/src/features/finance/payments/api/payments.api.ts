import { apiClient } from '@/lib/api/axios';
import { Payment, PaymentAllocation, PaginatedResponse, SingleResponse } from '../types';
import { RecordPaymentFormValues, AllocatePaymentFormValues } from '../schema';

export const paymentsApi = {
  getPayments: async (params?: { page?: number; limit?: number; search?: string; status?: string; bookingId?: string; invoiceId?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Payment>>('/payments', { params });
    return response.data;
  },

  getPayment: async (id: string) => {
    const response = await apiClient.get<SingleResponse<Payment>>(`/payments/${id}`);
    return response.data;
  },

  createPayment: async (data: RecordPaymentFormValues) => {
    const response = await apiClient.post<SingleResponse<Payment>>('/payments', data);
    return response.data;
  },

  updatePaymentStatus: async (id: string, status: string, gatewayTransactionId?: string) => {
    const response = await apiClient.patch<SingleResponse<Payment>>(`/payments/${id}`, { status, gatewayTransactionId });
    return response.data;
  },

  getAllocations: async (params?: { page?: number; limit?: number; paymentId?: string; invoiceId?: string }) => {
    const response = await apiClient.get<PaginatedResponse<PaymentAllocation>>('/payment-allocations', { params });
    return response.data;
  },

  allocatePayment: async (paymentId: string, data: AllocatePaymentFormValues) => {
    const response = await apiClient.post<SingleResponse<PaymentAllocation>>('/payment-allocations', { ...data, paymentId });
    return response.data;
  },
};
