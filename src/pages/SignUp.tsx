import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import {motion} from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const SignUp = () => {
  // Use the proxy configured in vite.config.ts instead of the direct server URL
  const serverUrl = import.meta.env.VITE_SERVER_URL || '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {isLight} = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting to sign up with:", { name, email, password: "********" });

      const response = await fetch(`${serverUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include' // Include cookies in the request
      });

      console.log("Response status:", response.status);

      // Always try to parse the response, even if it's an error
      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : {};
        console.log("Response data:", data);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        data = { message: 'Invalid server response' };
      }

      if (response.ok) {
        toast.success('Account created successfully!');
        navigate('/login');
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={`min-h-[calc(100vh-4.1rem)] flex items-center justify-center py-6 px-3 xs:py-8 xs:px-4 sm:px-6 lg:px-8 ${
        isLight ? 'bg-gray-50' : 'bg-gray-900'
      }`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md space-y-6 xs:space-y-8">
        <div>
          <div className="flex justify-center">
            <div className={`p-2 xs:p-3 rounded-full ${
              isLight ? 'bg-blue-100' : 'bg-gray-800'
            }`}>
              <UserPlus className={`h-8 w-8 xs:h-10 xs:w-10 ${
                isLight ? 'text-primary-light' : 'text-primary-dark'
              }`} />
            </div>
          </div>
          <h2 className={`mt-4 xs:mt-6 text-center text-xl xs:text-2xl sm:text-3xl font-bold ${
            isLight ? 'text-gray-900' : 'text-gray-100'
          }`}>
            Create your account
          </h2>
          <p className={`mt-2 text-center text-xs xs:text-sm ${
            isLight ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Already have an account?{' '}
            <a href="/login" className={`font-medium ${
              isLight ? 'text-primary-light hover:text-blue-600' : 'text-primary-dark hover:text-emerald-400'
            }`}>
              Sign in
            </a>
          </p>
        </div>
        <form className="mt-6 xs:mt-8 space-y-5 xs:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-3 xs:space-y-4">
            <div>
              <label htmlFor="name" className={`block text-xs xs:text-sm font-medium mb-1 ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                className={`appearance-none block w-full px-3 py-2 border rounded-md text-xs xs:text-sm ${
                  isLight
                    ? 'border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-primary-light focus:border-primary-light bg-white'
                    : 'border-gray-700 placeholder-gray-500 text-white focus:ring-primary-dark focus:border-primary-dark bg-gray-800'
                } focus:outline-none focus:ring-2`}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className={`block text-xs xs:text-sm font-medium mb-1 ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className={`appearance-none block w-full px-3 py-2 border rounded-md text-xs xs:text-sm ${
                  isLight
                    ? 'border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-primary-light focus:border-primary-light bg-white'
                    : 'border-gray-700 placeholder-gray-500 text-white focus:ring-primary-dark focus:border-primary-dark bg-gray-800'
                } focus:outline-none focus:ring-2`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className={`block text-xs xs:text-sm font-medium mb-1 ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className={`appearance-none block w-full px-3 py-2 border rounded-md text-xs xs:text-sm ${
                  isLight
                    ? 'border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-primary-light focus:border-primary-light bg-white'
                    : 'border-gray-700 placeholder-gray-500 text-white focus:ring-primary-dark focus:border-primary-dark bg-gray-800'
                } focus:outline-none focus:ring-2`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SignUp;