// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for authentication on mount and when auth state changes
  useEffect(() => {
    // Check if we're coming from auth-callback
    const fromCallback = sessionStorage.getItem('auth_success') === 'true';

    // If we're coming from auth-callback, give a bit more time for auth state to update
    const checkDelay = fromCallback ? 500 : 0;

    const timer = setTimeout(() => {
      setIsCheckingAuth(false);

      // If we're coming from auth-callback but still not authenticated, show an error
      if (fromCallback && !isAuthenticated) {
        console.error('Failed to authenticate after callback');
        toast.error('Authentication failed. Please try logging in again.', { id: 'auth-failed' });
        // Clear the flag
        sessionStorage.removeItem('auth_success');
      }
    }, checkDelay);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
