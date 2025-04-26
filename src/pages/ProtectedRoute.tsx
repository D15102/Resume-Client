  // src/components/ProtectedRoute.tsx
  import { Navigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';
  import React from 'react';

  interface Props {
    children: JSX.Element;
  }

  const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      const token = localStorage.getItem("token");
      return token ? children : <Navigate to="/login" replace />;
    }

    return children;
  };

  export default ProtectedRoute;
