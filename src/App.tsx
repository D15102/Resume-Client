import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ResumeTemplates from './pages/ResumeTemplates.tsx';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import EditResume from './pages/EditResume.tsx'
import ProtectedRoute from './pages/ProtectedRoute.tsx';
import EditResumePage from './pages/EditResumePage.tsx';
import AuthCallback from './pages/AuthCallback.tsx';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Import global styles
import './styles/globals.css';

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check for redirect flag on component mount
  useEffect(() => {
    // Check for redirect flag
    const redirectToDashboard = sessionStorage.getItem('redirect_to_dashboard');

    // Check for base URL (set by AuthCallback)
    const baseUrl = sessionStorage.getItem('base_url');

    if (redirectToDashboard === 'true') {
      console.log('Found redirect flag, navigating to dashboard');
      // Clear the flag
      sessionStorage.removeItem('redirect_to_dashboard');

      // If we're in production and have a stored base URL, use it for navigation
      if (import.meta.env.PROD && baseUrl) {
        console.log('Using stored base URL for navigation:', baseUrl);
        window.location.href = `${baseUrl}/dashboard`;
        return;
      }

      // Otherwise use React Router
      navigate('/dashboard');
    }

    // Special handling for auth-callback path in production
    if (import.meta.env.PROD && location.pathname.includes('auth-callback')) {
      console.log('Detected auth-callback path in production, checking for token in URL');

      // If we have a token in the URL, extract it and redirect
      const path = location.pathname;
      if (path.includes('token=')) {
        console.log('Found token in URL path, redirecting to auth-callback.html');

        // Get the base URL
        const currentBaseUrl = window.location.href.split('/auth-callback')[0];

        // Redirect to the static auth-callback.html page
        window.location.href = `${currentBaseUrl}/auth-callback.html${location.hash}`;
      }
    }
  }, [navigate, location]);

  return (
    <>
      {/* Don't show Navbar on auth-callback page */}
      {location.pathname !== '/auth-callback' && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/templates" element={<ResumeTemplates />} />
          <Route path='/editResume' element={<EditResume />} />
          <Route path='/resumepage' element={
            <ProtectedRoute>
              <EditResumePage />
            </ProtectedRoute>
          } />
          <Route path="/auth-callback" element={<AuthCallback />} />
        </Routes>
      </AnimatePresence>
      <Toaster
        position="top-right"
        toastOptions={{
          // Default options for all toasts
          className: '',
          style: {
            borderRadius: '8px',
            background: 'var(--toaster-bg, #fff)',
            color: 'var(--toaster-color, #333)',
          },
          // Customize based on toast type
          success: {
            style: {
              background: 'var(--toaster-success-bg, #10b981)',
              color: 'var(--toaster-success-color, #fff)',
            },
          },
          error: {
            style: {
              background: 'var(--toaster-error-bg, #ef4444)',
              color: 'var(--toaster-error-color, #fff)',
            },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
