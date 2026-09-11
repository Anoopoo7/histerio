'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GenericMessageResponse, LoginPayload, RegisterPayload, User } from '@/types';
import {
  loginApi,
  registerApi,
  getStoredToken,
  setStoredToken,
  registerUnauthorizedHandler,
} from '@/lib/api';

const USER_KEY = 'histeria_user_data';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<GenericMessageResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedUserStr = localStorage.getItem(USER_KEY);
    if (savedUserStr) {
      try {
        return JSON.parse(savedUserStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    setStoredToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
    setToken(null);
    setUser(null);
    if (pathname.startsWith('/dashboard')) {
      router.push('/login');
    }
  }, [pathname, router]);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  const login = async (payload: LoginPayload) => {
    const res = await loginApi(payload);
    setStoredToken(res.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    setToken(res.accessToken);
    setUser(res.user);
    router.push('/dashboard');
  };

  const register = async (payload: RegisterPayload): Promise<GenericMessageResponse> => {
    return await registerApi(payload);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
