import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login, logout, getCurrentUser, isAuthenticated } from '../services/authService';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    const response = await login(credentials);
    setUser(response.user);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};