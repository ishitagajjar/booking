import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import httpClient, { setAccessToken } from '@/api/httpClient';
import { User, ApiResponse, AuthData, LoginCredentials, RegisterData } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await httpClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
      if (data.IsSuccess && data.Data) {
        setAccessToken(data.Data.accessToken);
        // Decode user from token or make a separate call — for now we store on login
      }
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    const { data } = await httpClient.post<ApiResponse<AuthData>>('/auth/login', credentials);
    if (data.IsSuccess && data.Data) {
      setAccessToken(data.Data.accessToken);
      setUser(data.Data.user);
    } else {
      throw new Error(data.Message);
    }
  };

  const register = async (registerData: RegisterData) => {
    const { data } = await httpClient.post<ApiResponse<AuthData>>('/auth/register', registerData);
    if (data.IsSuccess && data.Data) {
      setAccessToken(data.Data.accessToken);
      setUser(data.Data.user);
    } else {
      throw new Error(data.Message);
    }
  };

  const logout = async () => {
    try {
      await httpClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
