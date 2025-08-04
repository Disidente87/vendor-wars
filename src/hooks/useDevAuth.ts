'use client';

import { useState, useEffect } from 'react';

interface DevUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

interface UseDevAuthReturn {
  isAuthenticated: boolean;
  user: DevUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

export function useDevAuth(): UseDevAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<DevUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated (stored in localStorage)
    const storedUser = localStorage.getItem('dev-auth-user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock user
    const mockUser: DevUser = {
      fid: 12345,
      username: 'dev_user',
      displayName: 'Development User',
      pfpUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
    };
    
    // Store user in localStorage
    localStorage.setItem('dev-auth-user', JSON.stringify(mockUser));
    
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const signOut = () => {
    localStorage.removeItem('dev-auth-user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    signIn,
    signOut
  };
} 