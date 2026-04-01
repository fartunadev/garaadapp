import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type AppRole = 'admin' | 'moderator' | 'user' | 'seller';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: AppRole;
  roles?: AppRole[];
}

const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        const userData: AuthUser = res.data?.data || res.data;
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          // Axios interceptor already cleared localStorage, just sync state
          setUser(null);
        }
        // For network errors or 5xx, keep the stored user — don't log out
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const res = await api.post('/auth/register', { email, password, fullName });
      const { token, user: userData } = res.data?.data || res.data;
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setUser(userData);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data?.message || err.message || 'Registration failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data?.data || res.data;
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setUser(userData);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data?.message || err.message || 'Login failed' };
    }
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout errors
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
    }
    return { error: null };
  };

  return {
    user,
    session: user ? { user } : null,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};

export const useUserRoles = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      const storedUser = getStoredUser();
      if (storedUser?.roles) return storedUser.roles as AppRole[];
      if (storedUser?.role) return [storedUser.role] as AppRole[];
      try {
        const res = await api.get('/auth/me');
        const userData = res.data?.data || res.data;
        if (userData.roles) return userData.roles as AppRole[];
        if (userData.role) return [userData.role] as AppRole[];
      } catch {
        // ignore
      }
      return [];
    },
    enabled: !!userId,
  });
};

export const useHasRole = (userId: string | undefined, role: AppRole) => {
  const { data: roles, isLoading } = useUserRoles(userId);
  return {
    hasRole: roles?.includes(role) ?? false,
    isLoading,
  };
};

export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, isLoading: roleLoading } = useHasRole(user?.id, 'admin');

  return {
    isAdmin: hasRole,
    isLoading: authLoading || roleLoading,
  };
};
