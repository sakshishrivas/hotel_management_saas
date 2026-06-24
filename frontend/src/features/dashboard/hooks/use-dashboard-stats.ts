import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboardStats() {
  const revenueQuery = useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: dashboardApi.getRevenueSummary,
  });

  const bookingsQuery = useQuery({
    queryKey: ['dashboard', 'bookings', 'active'],
    queryFn: dashboardApi.getActiveBookings,
  });

  const customersQuery = useQuery({
    queryKey: ['dashboard', 'customers'],
    queryFn: dashboardApi.getCustomersCount,
  });

  const recentBookingsQuery = useQuery({
    queryKey: ['dashboard', 'recent-bookings'],
    queryFn: dashboardApi.getRecentBookings,
  });

  const isLoading = 
    revenueQuery.isLoading || 
    bookingsQuery.isLoading || 
    customersQuery.isLoading ||
    recentBookingsQuery.isLoading;

  return {
    revenue: revenueQuery.data?.data?.revenue?.totalPaymentsCaptured || 0,
    activeBookingsCount: bookingsQuery.data?.meta?.total || 0,
    customersCount: customersQuery.data?.meta?.total || 0,
    recentBookings: recentBookingsQuery.data?.data || [],
    isLoading,
  };
}
