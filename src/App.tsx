import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ResumeTemplates from './pages/ResumeTemplates.tsx';
import { AuthProvider } from './context/AuthContext';
import EditResume from './pages/EditResume.tsx'
import ProtectedRoute from './pages/ProtectedRoute.tsx';
import EditResumePage from './pages/EditResumePage.tsx';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

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
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
