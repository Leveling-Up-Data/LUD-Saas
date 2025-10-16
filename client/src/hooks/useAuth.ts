
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useAuth() {
  const [user, setUser] = useState(null);

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/user');
        const userData = await response.json();
        return userData;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  const isAuthenticated = !!userData && !error;

  return {
    user: userData,
    isAuthenticated,
    isLoading,
    setUser
  };
}
