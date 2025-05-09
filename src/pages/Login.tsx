import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { IoMdEyeOff } from "react-icons/io";
import { IoMdEye } from "react-icons/io";
import { useTheme } from "../context/ThemeContext";
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from "react-google-recaptcha";

const pageVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const formVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.2 } },
};

const buttonVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.3 } },
  hover: { scale: 1.03 },
  tap: { scale: 0.97 },
};

const Login = () => {
  // Use the proxy configured in vite.config.ts instead of the direct server URL
  const serverUrl = import.meta.env.VITE_SERVER_URL || '';
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Default is Google's test key
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { isLight } = useTheme();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle reCAPTCHA verification
  const handleCaptchaChange = (token: string | null) => {
    if (token) {
      console.log("reCAPTCHA verified:", token.substring(0, 10) + "...");
      setCaptchaVerified(true);
    } else {
      console.log("reCAPTCHA verification failed or expired");
      setCaptchaVerified(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if reCAPTCHA is verified
    if (!captchaVerified) {
      toast.error("Please verify that you are not a robot");
      return;
    }

    try {
      console.log("Server URL:", serverUrl);
      console.log("Attempting to login with:", { email, password: "********" });

      // Show loading toast
      toast.loading('Verifying credentials...', { id: 'login-loading' });

      // Get the reCAPTCHA token
      const token = recaptchaRef.current?.getValue() || '';

      // First, check if the user exists in the database
      const response = await fetch(`${serverUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          recaptchaToken: token
        }),
        credentials: "include"
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      // Dismiss loading toast
      toast.dismiss('login-loading');

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // If we get here, the user exists and credentials are valid
      if (data.token && data.user) {
        // Store user information for OTP verification
        sessionStorage.setItem('verificationEmail', email);

        // Get phone number from response if available, otherwise use a default
        const phoneNumber = data.user.phoneNumber || '+1234567890';
        sessionStorage.setItem('verificationPhone', phoneNumber);

        // Store token temporarily for after OTP verification
        sessionStorage.setItem('temp_auth_token', data.token);
        sessionStorage.setItem('temp_user_data', JSON.stringify(data.user));

        try {
          // Show loading toast for OTP sending
          toast.loading('Sending OTP...', { id: 'sending-otp' });

          // Get the OTP from the server response or generate one
          let otpValue = '';

          // Send OTP request to the server (SMS functionality is commented out on the server)
          const otpResponse = await fetch(`${serverUrl}/api/auth/send-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: phoneNumber.replace('+', ''), // Still sending phone for compatibility
              email: email // Include email to help with OTP verification
            }),
          });

          const otpData = await otpResponse.json();

          // Store the OTP value for email sending
          if (otpResponse.ok && otpData.success) {
            // If the server returns the OTP value, use it
            otpValue = otpData.otp || '123456'; // Fallback to a default if not provided

            // Send OTP via email using EmailJS
            try {
              // Initialize EmailJS
              emailjs.init("C9rw1HuEBWiPQBXxZ");

              console.log('Sending OTP email with value:', otpValue);

              // Send OTP email using EmailJS with the template ID provided by the user
              await emailjs.send(
                "service_zs8dfds", // Your EmailJS service ID
                "template_7dnvzrf", // Template ID for OTP
                {
                  name: data.user.name || 'User',
                  email: email,
                  otp: otpValue, // Send the OTP in the email
                  phoneNumber: phoneNumber // Include phone number in case it's needed in the template
                }
              );

              console.log('OTP email sent successfully');

              // Store the OTP in sessionStorage for verification (only in development)
              if (import.meta.env.DEV) {
                sessionStorage.setItem('debug_otp', otpValue);
                console.log('OTP stored in sessionStorage for debugging:', otpValue);
              }
            } catch (emailError) {
              console.error('Error sending OTP email:', emailError);
              toast.error('Failed to send OTP email. Please try again or use Resend OTP option.');
              // Don't block the process if email fails
            }

            // Dismiss loading toast
            toast.dismiss('sending-otp');

            // Show success toast
            toast.success("OTP sent successfully. Please verify your identity.");

            // Redirect to OTP verification page
            navigate("/verify-otp");
          } else {
            throw new Error(otpData.message || 'Failed to send OTP');
          }
        } catch (otpError) {
          console.error('OTP sending error:', otpError);
          toast.error('Failed to send OTP. Please try again.');

          // Dismiss loading toast if it's still showing
          toast.dismiss('sending-otp');

          // Even if OTP sending fails, we'll still redirect to verification
          // In a production app, you might want to handle this differently
          navigate("/verify-otp");
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : "An error occurred during login");
    }
  };

  const [eyeOpen, seteyeOpen] = useState(true)
  function handleEye(){
    seteyeOpen(!eyeOpen)
  }
  // Check for error parameters in URL
  useEffect(() => {
    // Dismiss any loading toasts that might be active
    toast.dismiss('google-auth-loading');

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const message = params.get('message');

    if (error) {
      console.error('Auth error:', error);
      console.error('Error message:', message);

      switch (error) {
        case 'auth_failed':
          toast.error(message || 'Google authentication failed. Please try again.', {
            id: 'google-auth-error',
            duration: 5000
          });
          break;
        case 'session_error':
          toast.error(message || 'Session error occurred. Please try again.', {
            id: 'session-error',
            duration: 5000
          });
          break;
        case 'server_error':
          toast.error(message || 'Server error occurred. Please try again.', {
            id: 'server-error',
            duration: 5000
          });
          break;
        default:
          toast.error(message || 'Authentication error. Please try again.', {
            id: 'auth-error',
            duration: 5000
          });
      }

      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Clear any existing auth cookies that might be leftover
    document.cookie = 'temp_auth_token=; Max-Age=-99999999; path=/;';
  }, []);

  // Debug eye state
  useEffect(() => {
    console.log(eyeOpen);
  }, [eyeOpen]);

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-center">
            <div className={`p-2 xs:p-3 rounded-full ${
              isLight ? 'bg-blue-100' : 'bg-gray-800'
            }`}>
              <LogIn className={`h-8 w-8 xs:h-10 xs:w-10 ${
                isLight ? 'text-primary-light' : 'text-primary-dark'
              }`} />
            </div>
          </div>
          <h2 className={`mt-4 xs:mt-6 text-center text-xl xs:text-2xl sm:text-3xl font-bold ${
            isLight ? 'text-gray-900' : 'text-gray-100'
          }`}>
            Sign in to your account
          </h2>
          <p className={`mt-2 text-center text-xs xs:text-sm ${
            isLight ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Or{' '}
            <Link to="/signup" className={`font-medium ${
              isLight ? 'text-primary-light hover:text-blue-600' : 'text-primary-dark hover:text-emerald-400'
            }`}>
              create a new account
            </Link>
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          className="mt-6 xs:mt-8 space-y-5 xs:space-y-6"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="rounded-md shadow-sm space-y-3 xs:space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-xs xs:text-sm font-medium mb-1 ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 xs:pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-4 w-4 xs:h-5 xs:w-5 ${
                    isLight ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-8 xs:pl-10 pr-3 py-2 border rounded-md text-xs xs:text-sm ${
                    isLight
                      ? 'border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-primary-light focus:border-primary-light bg-white'
                      : 'border-gray-700 placeholder-gray-500 text-white focus:ring-primary-dark focus:border-primary-dark bg-gray-800'
                  } focus:outline-none focus:ring-2`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-xs xs:text-sm font-medium mb-1 ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 xs:pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-4 w-4 xs:h-5 xs:w-5 ${
                    isLight ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={eyeOpen ? "password" : "text"}
                  autoComplete="current-password"
                  required
                  maxLength={30}
                  className={`appearance-none block w-full pl-8 xs:pl-10 pr-8 xs:pr-10 py-2 border rounded-md text-xs xs:text-sm ${
                    isLight
                      ? 'border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-primary-light focus:border-primary-light bg-white'
                      : 'border-gray-700 placeholder-gray-500 text-white focus:ring-primary-dark focus:border-primary-dark bg-gray-800'
                  } focus:outline-none focus:ring-2`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-2 xs:pr-3 flex items-center">
                  {eyeOpen ? (
                    <IoMdEye
                      className={`h-4 w-4 xs:h-5 xs:w-5 cursor-pointer ${
                        isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
                      }`}
                      onClick={handleEye}
                    />
                  ) : (
                    <IoMdEyeOff
                      className={`h-4 w-4 xs:h-5 xs:w-5 cursor-pointer ${
                        isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
                      }`}
                      onClick={handleEye}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between space-y-3 xs:space-y-0">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-3 w-3 xs:h-4 xs:w-4 rounded ${
                  isLight
                    ? 'text-primary-light focus:ring-primary-light border-gray-300'
                    : 'text-primary-dark focus:ring-primary-dark border-gray-700 bg-gray-800'
                }`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-xs xs:text-sm ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Remember me
              </label>
            </div>

            <div className="text-xs xs:text-sm">
              <a href="#" className={`font-medium ${
                isLight ? 'text-primary-light hover:text-blue-600' : 'text-primary-dark hover:text-emerald-400'
              }`}>
                Forgot password?
              </a>
            </div>
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={recaptchaKey}
              onChange={handleCaptchaChange}
              theme={isLight ? 'light' : 'dark'}
            />
          </div>

          <div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs xs:text-sm font-medium rounded-md text-white ${
                isLight
                  ? 'bg-primary-light hover:bg-blue-600'
                  : 'bg-primary-dark hover:bg-emerald-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLight ? 'focus:ring-primary-light' : 'focus:ring-primary-dark'
              } transition-colors duration-200`}
            >
              Sign in
            </motion.button>
          </div>
        </motion.form>

        {/* Social Login */}
        <motion.div
          className="mt-5 xs:mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${
                isLight ? 'border-gray-300' : 'border-gray-700'
              }`}></div>
            </div>
            <div className="relative flex justify-center text-xs xs:text-sm">
              <span className={`px-2 ${
                isLight ? 'bg-gray-50 text-gray-500' : 'bg-gray-900 text-gray-400'
              }`}>
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-4 xs:mt-6 flex justify-center">
            <a
              href={`${serverUrl}/api/auth/google`}
              onClick={() => {
                // Show loading toast
                toast.loading('Connecting to Google...', { id: 'google-auth-loading' });
              }}
              className={`flex items-center justify-center gap-2 px-3 xs:px-4 py-1.5 xs:py-2 border rounded-md text-xs xs:text-sm font-medium transition-colors duration-200 ${
                isLight
                  ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                  : 'border-gray-700 hover:bg-gray-800 text-gray-200'
              }`}
            >
              <svg className="h-4 w-4 xs:h-5 xs:w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              <span>Sign in with Google</span>
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;

