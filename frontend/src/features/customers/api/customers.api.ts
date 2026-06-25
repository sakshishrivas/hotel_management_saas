import { apiClient } from '@/lib/api/axios';
import { Customer, PaginatedResponse, SingleResponse } from '../types';
import { CustomerFormValues } from '../schema';

export const customersApi = {
  getCustomers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Customer>>('/customers', { params });
    return response.data;
  },

  getCustomer: async (id: string) => {
    const response = await apiClient.get<SingleResponse<Customer>>(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (data: CustomerFormValues) => {
    const response = await apiClient.post<SingleResponse<Customer>>('/customers', data);
    return response.data;
  },

  updateCustomer: async (id: string, data: Partial<CustomerFormValues>) => {
    const response = await apiClient.patch<SingleResponse<Customer>>(`/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};
