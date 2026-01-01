"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

import { authApi } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  totalAnalyses: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateCredits: (credits: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authApi.getProfile() as { 
        success: boolean; 
        data?: { 
          name: string; 
          email: string; 
          userId: string;
          plan?: string;
          credits?: number;
          totalAnalyses?: number;
        } 
      };
      if (response.success && response.data) {
        setUser({
          id: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          plan: (response.data.plan as 'free' | 'pro' | 'enterprise') || 'free',
          credits: response.data.credits ?? 3,
          totalAnalyses: response.data.totalAnalyses || 0,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const updateCredits = (credits: number) => {
    if (user) {
      setUser({ ...user, credits });
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password) as { success: boolean; data?: { name: string; email: string; userId: string } };
    if (response.success && response.data) {
      // After login, fetch full profile to get plan/credits
      await checkAuth();
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await authApi.signup(name, email, password) as { success: boolean; data?: { name: string; email: string; userId: string } };
    if (response.success && response.data) {
      setUser({
        id: response.data.userId,
        name: response.data.name,
        email: response.data.email,
        plan: 'free',
        credits: 3, // New users get 3 credits
        totalAnalyses: 0,
      });
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        checkAuth,
        updateCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
