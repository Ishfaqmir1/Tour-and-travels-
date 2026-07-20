'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  profile_photo_url: string | null;
  is_super_admin: boolean;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lazy import ApiClient to avoid axios SSR issues (accesses `location` during module init)
let _ApiClientModule: any = null;
async function getAuthApi() {
  if (!_ApiClientModule) {
    const mod = await import('./api-client');
    _ApiClientModule = mod.default;
  }
  return _ApiClientModule;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const ApiClient = await getAuthApi();
      if (ApiClient.isAuthenticated()) {
        const api = new ApiClient();
        const response = await api.getMe();
        if (response?.status === 'success' && response?.user) {
          setUser(response.user);
          ApiClient.setUser(response.user);
        }
      } else {
        const storedUser = ApiClient.getUser();
        setUser(storedUser);
      }
    } catch {
      const ApiClient = await getAuthApi();
      const storedUser = ApiClient.getUser();
      setUser(storedUser);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const ApiClient = await getAuthApi();
    const api = new ApiClient();
    const data = await api.login(email, password);
    if (data?.status === 'success') {
      setUser(data.user);
    }
    return data;
  };

  const register = async (name: string, email: string, password: string) => {
    const ApiClient = await getAuthApi();
    const api = new ApiClient();
    const data = await api.register(name, email, password);
    if (data?.status === 'success') {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    const ApiClient = await getAuthApi();
    const api = new ApiClient();
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isSuperAdmin: !!(user?.is_super_admin ?? user?.isSuperAdmin),
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
