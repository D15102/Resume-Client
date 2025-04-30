import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: unknown;
  login: (token: string, userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
          // Set user from localStorage
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Verify with server (optional)
          try {
            const response = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              // Update user data if needed
              setUser(data.user);
            } else {
              // Token invalid, clear auth
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error('Error verifying auth:', error);
            // Continue with stored user data even if verification fails
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};