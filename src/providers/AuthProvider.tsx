'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GenericMessageResponse, LoginPayload, RegisterPayload, User } from '@/types';
import {
  loginApi,
  loginWithGoogleApi,
  linkGoogleAccountApi,
  unlinkGoogleAccountApi,
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
  loginWithGoogle: (credential: string) => Promise<void>;
  linkGoogle: (credential: string) => Promise<void>;
  unlinkGoogle: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
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

  const updateUser = useCallback((updatedUser: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
    setUser(updatedUser);
  }, []);

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

  const loginWithGoogle = async (credential: string) => {
    const res = await loginWithGoogleApi({ credential });
    setStoredToken(res.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    setToken(res.accessToken);
    setUser(res.user);
    router.push('/dashboard');
  };

  const linkGoogle = async (credential: string) => {
    const res = await linkGoogleAccountApi({ credential });
    if (res.accessToken) {
      setStoredToken(res.accessToken);
      setToken(res.accessToken);
    }
    if (res.user) {
      updateUser(res.user);
    }
  };

  const unlinkGoogle = async () => {
    await unlinkGoogleAccountApi();
    if (user) {
      const currentProviders = user.authProviders || [];
      const updatedProviders = currentProviders.filter((p) => p !== 'google');
      const updatedUser: User = {
        ...user,
        authProviders: updatedProviders,
      };
      updateUser(updatedUser);
    }
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
        loginWithGoogle,
        linkGoogle,
        unlinkGoogle,
        updateUser,
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
