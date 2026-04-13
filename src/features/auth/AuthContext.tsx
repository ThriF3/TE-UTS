import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { authService, LoginResponse } from '../../services/authService';
import { ApiClient } from '../../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if there's a persisted token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      ApiClient.setToken(token);
      // Try to fetch current user
      authService.getCurrentUser().then(res => {
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          ApiClient.setToken(null);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);

      if (response.success && response.data) {
        const { user: userData, token } = response.data as LoginResponse;
        ApiClient.setToken(token);
        
        const userWithDate: User = {
          ...userData,
          id: String(userData.id),
          createdAt: new Date().toISOString(),
        };
        
        setUser(userWithDate);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    ApiClient.setToken(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const canAccess = (role: UserRole, feature: string): boolean => {
  const permissions: Record<string, UserRole[]> = {
    contracts: ['admin', 'finance'],
    orders: ['admin', 'kasir', 'reseller', 'pelanggan'],
    pos: ['admin', 'kasir'],
    returns: ['admin', 'kasir', 'finance'],
    reports: ['admin', 'finance'],
    masterdata: ['admin'],
    settings: ['admin'],
    stock: ['admin', 'kasir'],
  };
  return permissions[feature]?.includes(role) ?? false;
};
