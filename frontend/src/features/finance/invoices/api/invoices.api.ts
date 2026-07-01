import { apiClient } from '@/lib/api/axios';
import { Invoice, InvoiceItem, PaginatedResponse, SingleResponse } from '../types';
import { GenerateInvoiceFormValues, InvoiceItemFormValues } from '../schema';

export const invoicesApi = {
  getInvoices: async (params?: { page?: number; limit?: number; search?: string; status?: string; bookingId?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/invoices', { params });
    return response.data;
  },

  getInvoice: async (id: string) => {
    const response = await apiClient.get<SingleResponse<Invoice>>(`/invoices/${id}`);
    return response.data;
  },

  generateInvoice: async (data: GenerateInvoiceFormValues) => {
    const response = await apiClient.post<SingleResponse<Invoice>>('/invoices', data);
    return response.data;
  },

  updateInvoiceStatus: async (id: string, status: string) => {
    const response = await apiClient.patch<SingleResponse<Invoice>>(`/invoices/${id}`, { status });
    return response.data;
  },

  getInvoiceItems: async (params?: { page?: number; limit?: number; invoiceId?: string }) => {
    const response = await apiClient.get<PaginatedResponse<InvoiceItem>>('/invoice-items', { params });
    return response.data;
  },

  addInvoiceItem: async (invoiceId: string, data: InvoiceItemFormValues) => {
    const response = await apiClient.post<SingleResponse<InvoiceItem>>('/invoice-items', { ...data, invoiceId });
    return response.data;
  },

  updateInvoiceItem: async (id: string, data: Partial<InvoiceItemFormValues>) => {
    const response = await apiClient.patch<SingleResponse<InvoiceItem>>(`/invoice-items/${id}`, data);
    return response.data;
  },

  deleteInvoiceItem: async (id: string) => {
    const response = await apiClient.delete(`/invoice-items/${id}`);
    return response.data;
  },
};
