import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Import global styles
import './styles/globals.css';

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <Navbar />
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
