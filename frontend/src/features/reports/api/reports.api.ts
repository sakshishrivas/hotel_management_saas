import { apiClient } from '@/lib/api/axios';
import type {
  DateRangeFilter,
  PaginatedFilter,
  SearchFilter,
  PaginatedResponse,
  Booking,
  Room,
  Customer,
  Invoice,
  Payment,
  Refund,
  Hotel,
} from '../types';

export const reportsApi = {
  // --- Revenue ---
  getRevenueSummary: async (params: DateRangeFilter) => {
    const response = await apiClient.get('/reports/revenue', { params });
    return response.data;
  },

  getOutstandingInvoices: async (params: PaginatedFilter) => {
    const response = await apiClient.get('/reports/outstanding-invoices', { params });
    return response.data;
  },

  getPaymentHistory: async (params: DateRangeFilter & { page?: number; limit?: number }) => {
    const response = await apiClient.get('/reports/payment-history', { params });
    return response.data;
  },

  // --- Bookings ---
  getBookings: async (params?: SearchFilter) => {
    const response = await apiClient.get<PaginatedResponse<Booking>>('/bookings', { params });
    return response.data;
  },

  // --- Rooms ---
  getRooms: async (params?: SearchFilter) => {
    const response = await apiClient.get<PaginatedResponse<Room>>('/rooms', { params });
    return response.data;
  },

  // --- Customers ---
  getCustomers: async (params?: SearchFilter) => {
    const response = await apiClient.get<PaginatedResponse<Customer>>('/customers', { params });
    return response.data;
  },

  // --- Invoices ---
  getInvoices: async (params?: SearchFilter & { bookingId?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/invoices', { params });
    return response.data;
  },

  // --- Payments ---
  getPayments: async (params?: SearchFilter & { bookingId?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Payment>>('/payments', { params });
    return response.data;
  },

  // --- Refunds ---
  getRefunds: async (params?: SearchFilter & { paymentId?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Refund>>('/refunds', { params });
    return response.data;
  },

  // --- Hotels (for filters) ---
  getHotels: async () => {
    const response = await apiClient.get<PaginatedResponse<Hotel>>('/hotels', { params: { limit: 100 } });
    return response.data;
  },
};
