import { apiClient } from '../../../lib/api/axios';
import { useAuthStore } from '../store/auth.store';
import { LoginCredentials, AuthResponse } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Always clear local state even if API fails
      useAuthStore.getState().logout();
    }
  },
};
