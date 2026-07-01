import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';
import type { DateRangeFilter, PaginatedFilter, SearchFilter } from '../types';

// --- Revenue Hooks ---
export function useRevenueSummary(params: DateRangeFilter) {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: () => reportsApi.getRevenueSummary(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useOutstandingInvoices(params: PaginatedFilter) {
  return useQuery({
    queryKey: ['reports', 'outstanding-invoices', params],
    queryFn: () => reportsApi.getOutstandingInvoices(params),
  });
}

export function usePaymentHistory(params: DateRangeFilter & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['reports', 'payment-history', params],
    queryFn: () => reportsApi.getPaymentHistory(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

// --- Bookings Hook ---
export function useReportBookings(params?: SearchFilter) {
  return useQuery({
    queryKey: ['reports', 'bookings', params],
    queryFn: () => reportsApi.getBookings(params),
  });
}

// --- Rooms Hook ---
export function useReportRooms(params?: SearchFilter) {
  return useQuery({
    queryKey: ['reports', 'rooms', params],
    queryFn: () => reportsApi.getRooms(params),
  });
}

// --- Customers Hook ---
export function useReportCustomers(params?: SearchFilter) {
  return useQuery({
    queryKey: ['reports', 'customers', params],
    queryFn: () => reportsApi.getCustomers(params),
  });
}

// --- Invoices Hook ---
export function useReportInvoices(params?: SearchFilter & { bookingId?: string }) {
  return useQuery({
    queryKey: ['reports', 'invoices', params],
    queryFn: () => reportsApi.getInvoices(params),
  });
}

// --- Payments Hook ---
export function useReportPayments(params?: SearchFilter & { bookingId?: string }) {
  return useQuery({
    queryKey: ['reports', 'payments', params],
    queryFn: () => reportsApi.getPayments(params),
  });
}

// --- Refunds Hook ---
export function useReportRefunds(params?: SearchFilter & { paymentId?: string }) {
  return useQuery({
    queryKey: ['reports', 'refunds', params],
    queryFn: () => reportsApi.getRefunds(params),
  });
}

// --- Hotels Hook (for filters) ---
export function useHotelsForFilter() {
  return useQuery({
    queryKey: ['reports', 'hotels-filter'],
    queryFn: () => reportsApi.getHotels(),
    staleTime: 5 * 60 * 1000,
  });
}
