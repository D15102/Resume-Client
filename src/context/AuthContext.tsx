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
        console.log('Checking authentication state');
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        // Check for temp token from auth callback
        const tempToken = localStorage.getItem('temp_auth_token');

        if (tempToken) {
          console.log('Found temporary token from auth callback');
          // We'll handle this in the auth callback component
          // Just set loading to false here
          setIsLoading(false);
          return;
        }

        if (storedUser && token) {
          console.log('Found stored credentials, setting initial auth state');
          // Set user from localStorage
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Verify with server
          const serverUrl = import.meta.env.VITE_SERVER_URL || '';
          try {
            const url = serverUrl ? `${serverUrl}/api/auth/me` : '/api/auth/me';
            console.log('Verifying token with server at:', url);

            const response = await fetch(url, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              console.log('Token verified successfully');
              // Update user data if needed
              setUser(data.user);
            } else {
              console.error('Token verification failed:', response.status);
              // Token invalid, clear auth
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setIsAuthenticated(false);

              // Show error message if not in initial load
              if (isAuthenticated) {
                toast.error('Your session has expired. Please log in again.');
              }
            }
          } catch (error) {
            console.error('Error verifying auth:', error);
            // Continue with stored user data even if verification fails
          }
        } else {
          console.log('No stored credentials found');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  const login = (token: string, userData: any) => {
    console.log('Login called with token and user data');

    // Remove any temporary tokens
    localStorage.removeItem('temp_auth_token');

    // Store the actual credentials
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    // Update state
    setUser(userData);
    setIsAuthenticated(true);

    console.log('Authentication state updated');

    // Check if there's a redirect path stored
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      console.log('Found redirect path:', redirectPath);
      // Clear it
      sessionStorage.removeItem('redirectAfterLogin');
    }
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