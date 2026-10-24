import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  // Query /api/auth/me to check active session via httpOnly cookie
  const {
    data: authData,
    isLoading,
    isError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/auth/me');
        return res?.data?.user || null;
      } catch (err) {
        if (err.status === 401) {
          // Expected when not logged in
          return null;
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 min
    retry: false, // Don't retry on 401
  });

  const user = isError ? null : authData || null;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await api.post('/api/auth/login', { email, password });
      return res.data.user;
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(['authUser'], newUser);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password }) => {
      const res = await api.post('/api/auth/register', { name, email, password });
      return res.data.user;
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(['authUser'], newUser);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['authUser'], null);
      queryClient.clear();
    },
  });

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
