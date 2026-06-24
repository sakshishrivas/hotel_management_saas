import { apiClient } from '../../../lib/api/axios';

export const dashboardApi = {
  getRevenueSummary: async () => {
    // Current month start and end dates
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const response = await apiClient.get('/reports/revenue', {
      params: { startDate: firstDay, endDate: lastDay }
    });
    return response.data;
  },

  getActiveBookings: async () => {
    const response = await apiClient.get('/bookings', {
      params: { status: 'confirmed', limit: 1 } // We just want the meta.total
    });
    return response.data;
  },

  getCustomersCount: async () => {
    const response = await apiClient.get('/customers', {
      params: { limit: 1 }
    });
    return response.data;
  },

  getRecentBookings: async () => {
    const response = await apiClient.get('/bookings', {
      params: { limit: 5 }
    });
    return response.data;
  },
};
