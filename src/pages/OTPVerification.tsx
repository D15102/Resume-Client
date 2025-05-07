import React, { useState, useEffect, useRef, RefObject } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { Shield, ArrowLeft, Power, LogIn } from "lucide-react";
import axios from 'axios';
import emailjs from '@emailjs/browser';
import {
  motion,
  useAnimation,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from "framer-motion"
const pageVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const formVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.2 } },
};

// Motion variants for UI elements
const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};



const OTPVerification = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isLight } = useTheme();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [email, setEmail] = useState("");

  // Power slider animation states
  const [isPoweringOff, setIsPoweringOff] = useState(false)
  const x = useMotionValue(0)
  const controls = useAnimation()
  const constraintsRef = useRef(null)
  const textRef: RefObject<HTMLDivElement> = useRef(null)

  const xInput = [0, 164]
  const opacityOutput = [0, 1]
  // Transform for animation - used in the component
  const opacity = useTransform(x, xInput, opacityOutput)

  // Phone number is stored in sessionStorage but not needed as state since we're not displaying it
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const serverUrl = import.meta.env.VITE_SERVER_URL || '';
  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Get email and phone number from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail');
    const storedPhoneNumber = sessionStorage.getItem('verificationPhone');
    const storedToken = sessionStorage.getItem('temp_auth_token');
    const storedUserData = sessionStorage.getItem('temp_user_data');

    console.log('OTP Verification - Stored Data:', {
      email: storedEmail,
      phoneNumber: storedPhoneNumber ? 'exists' : 'missing',
      token: storedToken ? 'exists' : 'missing',
      userData: storedUserData ? 'exists' : 'missing'
    });

    if (storedEmail) {
      setEmail(storedEmail);
      // We no longer need to set phoneNumber as state
    } else {
      // If no email is stored, redirect back to login
      navigate('/login');
      toast.error('Please sign in first');
    }
  }, [navigate]);

  // Timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down for backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input when backspace is pressed on empty input
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste functionality
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');

    // Check if pasted content is a number and has correct length
    if (/^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const digits = pastedData.split('');
      const newOtp = [...otp];

      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });

      setOtp(newOtp);

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex(val => val === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };


  const verifyOtp = async() => {
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      toast.error('Please enter a complete 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Verifying OTP:', otpValue, 'for email:', email);

      // Call the server's verify-otp endpoint
      const response = await axios.post(`${serverUrl}/api/auth/verify-otp`, {
        userOtp: otpValue,
        email: email // Send the email to help the server find the user
      });

      console.log('OTP verification response:', response.data);

      // If the response status is not 200, throw an error to be caught by the catch block
      if (response.status !== 200) {
        throw new Error('OTP verification failed with status: ' + response.status);
      }

      if (response.data.success) {
        // Get stored token and user data
        const token = sessionStorage.getItem('temp_auth_token');
        const userData = sessionStorage.getItem('temp_user_data');

        console.log('OTP Verification - Auth Data Check:', {
          token: token ? 'exists' : 'missing',
          userData: userData ? 'exists' : 'missing'
        });

        if (!token || !userData) {
          console.error('Authentication data not found in sessionStorage');

          // If we have user data in the OTP verification response, use that instead
          if (response.data.token && response.data.user) {
            console.log('Using auth data from OTP verification response');

            // Show success toast
            toast.success('OTP verified successfully!');

            // Check if this is a first-time login (from server response)
            const isFirstLogin = response.data.isFirstLogin === true;

            // Check if this is a new registration (from signup process)
            const isNewRegistration = sessionStorage.getItem('is_new_registration') === 'true';

            // If this is a first login or a new registration, set the flag for the Dashboard to handle
            if (isFirstLogin || isNewRegistration) {
              console.log('First-time login detected, setting flag for Dashboard to send welcome email');

              // Set the first login flag
              sessionStorage.setItem('is_first_login', 'true');

              // Make sure the Google first login flag is NOT set for regular logins
              sessionStorage.removeItem('google_first_login');

              // Clear the new registration flag
              sessionStorage.removeItem('is_new_registration');

              // Set auth_success flag to ensure Dashboard shows welcome message
              sessionStorage.setItem('auth_success', 'true');

              // Make sure welcome_email_sent is not set in localStorage
              localStorage.removeItem('welcome_email_sent');

              console.log('OTP Verification: Set is_first_login flag to true for welcome email');
              console.log('OTP Verification: Cleared welcome_email_sent from localStorage');
            }

            // Complete the login process with the data from the response
            login(response.data.token, response.data.user);

            // Clear verification data from session storage
            sessionStorage.removeItem('verificationEmail');
            sessionStorage.removeItem('verificationPhone');

            // Redirect to dashboard
            navigate('/dashboard');
            return;
          } else {
            // If we don't have auth data anywhere, redirect to login
            toast.error('Authentication data not found. Please try logging in again.');
            navigate('/login');
            return;
          }
        }

        // Parse user data
        const user = JSON.parse(userData);

        // Show success toast
        toast.success('OTP verified successfully!');

        // Check if this is a first-time login (from server response)
        const isFirstLogin = response.data.isFirstLogin === true;

        // Check if this is a new registration (from signup process)
        const isNewRegistration = sessionStorage.getItem('is_new_registration') === 'true';

        // If this is a first login or a new registration, set the flag for the Dashboard to handle
        if (isFirstLogin || isNewRegistration) {
          console.log('First-time login detected, setting flag for Dashboard to send welcome email');

          // Set the first login flag
          sessionStorage.setItem('is_first_login', 'true');

          // Make sure the Google first login flag is NOT set for regular logins
          sessionStorage.removeItem('google_first_login');

          // Clear the new registration flag
          sessionStorage.removeItem('is_new_registration');

          // Set auth_success flag to ensure Dashboard shows welcome message
          sessionStorage.setItem('auth_success', 'true');

          // Make sure welcome_email_sent is not set in localStorage
          localStorage.removeItem('welcome_email_sent');

          console.log('OTP Verification: Set is_first_login flag to true for welcome email');
          console.log('OTP Verification: Cleared welcome_email_sent from localStorage');
        }

        // Complete the login process with the stored token and user data
        login(token, user);

        // Clear verification and temporary auth data from session storage
        sessionStorage.removeItem('verificationEmail');
        sessionStorage.removeItem('verificationPhone');
        sessionStorage.removeItem('temp_auth_token');
        sessionStorage.removeItem('temp_user_data');

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // OTP verification failed - stay on verification page
        console.error('OTP verification failed:', response.data);

        // Show error toast with more descriptive message
        toast.error(response.data.message || 'The OTP you entered is incorrect. Please check the code and try again.', {
          id: 'otp-verification-error',
          duration: 5000
        });

        // Reset the slider after failed verification
        setTimeout(() => {
          setIsPoweringOff(false);
          controls.start({ x: 0 });
          x.set(0);
        }, 1000);

        // Clear the OTP fields for a fresh attempt
        setOtp(['', '', '', '', '', '']);

        // Focus on the first input field
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }

        // We're staying on the verification page, so no navigation happens
        console.log('Staying on verification page due to incorrect OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);

      // Check if it's an axios error with a response
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server response:', error.response.data);
        // Show the specific error message from the server if available
        toast.error(error.response.data.message || 'The OTP you entered is incorrect. Please check the code and try again.', {
          id: 'otp-verification-error',
          duration: 5000
        });
      } else {
        toast.error('The OTP you entered is incorrect. Please check the code and try again.', {
          id: 'otp-verification-error',
          duration: 5000
        });
      }

      // Log that we're staying on the verification page
      console.log('Staying on verification page due to OTP verification error');

      // Reset the slider after error
      setTimeout(() => {
        setIsPoweringOff(false);
        controls.start({ x: 0 });
        x.set(0);
      }, 1000);

      // Clear the OTP fields for a fresh attempt
      setOtp(['', '', '', '', '', '']);

      // Focus on the first input field
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }

      // We're staying on the verification page, so no navigation happens
      console.log('Staying on verification page due to OTP verification error');
    } finally {
      setIsLoading(false);
    }
  }
  // Handle resend OTP
  const handleResendOtp = async () => {
    if (timer > 0) return;

    try {
      // Show loading toast
      toast.loading('Sending new OTP...', { id: 'resend-otp' });

      // Get the phone number from session storage (for compatibility)
      const storedPhone = sessionStorage.getItem('verificationPhone') || '+1234567890';
      const storedEmail = sessionStorage.getItem('verificationEmail');

      // Call the server's send-otp endpoint with both phone and email
      const response = await axios.post(`${serverUrl}/api/auth/send-otp`, {
        phone: storedPhone.replace('+', ''),
        email: storedEmail // Include email to help with OTP verification
      });

      // Dismiss loading toast
      toast.dismiss('resend-otp');

      if (response.data.success) {
        // Get the OTP from the response
        const otpValue = response.data.otp || '123456';

        try {
          // Initialize EmailJS
          emailjs.init("C9rw1HuEBWiPQBXxZ");

          console.log('Resending OTP email with value:', otpValue);

          // Send OTP email using EmailJS
          await emailjs.send(
            "service_zs8dfds", // Your EmailJS service ID
            "template_7dnvzrf", // Template ID for OTP
            {
              name: 'User',
              email: storedEmail,
              otp: otpValue,
              phoneNumber: storedPhone
            }
          );

          // Store the OTP in sessionStorage for verification (only in development)
          if (import.meta.env.DEV) {
            sessionStorage.setItem('debug_otp', otpValue);
            console.log('OTP stored in sessionStorage for debugging:', otpValue);
          }

          console.log('OTP email resent successfully');
        } catch (emailError) {
          console.error('Error resending OTP email:', emailError);
          // Don't block the process if email fails
        }

        toast.success('New OTP sent successfully');
        setTimer(30); // Reset timer
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
      toast.dismiss('resend-otp');
    }
  };


  //Smooth Ui
  useAnimationFrame((t) => {
    const duration = 2000
    const progress = (t % duration) / duration
    if (textRef.current) {
      textRef.current.style.setProperty("--x", `${(1 - progress) * 100}%`)
    }
  })

  const handleDragEnd = async () => {
    const dragDistance = x.get()
    if (dragDistance > 160) {
      await controls.start({ x: 168 })
      setIsPoweringOff(true)

      // Call the verifyOtp function when slider is fully dragged
      const otpValue = otp.join('');
      if (otpValue.length === 6) {
        verifyOtp();
      } else {
        toast.error('Please enter a complete 6-digit OTP first');
        // Reset the slider after a short delay
        setTimeout(() => {
          setIsPoweringOff(false)
          controls.start({ x: 0 })
          x.set(0)
        }, 1000)
      }
    } else {
      controls.start({ x: 0 })
    }
  }

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
              <Shield className={`h-8 w-8 xs:h-10 xs:w-10 ${
                isLight ? 'text-primary-light' : 'text-primary-dark'
              }`} />
            </div>
          </div>
          <h2 className={`mt-4 xs:mt-6 text-center text-xl xs:text-2xl sm:text-3xl font-bold ${
            isLight ? 'text-gray-900' : 'text-gray-100'
          }`}>
            Verify Your Account
          </h2>
          <p className={`mt-2 text-center text-xs xs:text-sm ${
            isLight ? 'text-gray-600' : 'text-gray-400'
          }`}>
            We've sent a 6-digit code to {email ? email : 'your email'}
          </p>
        </motion.div>

        {/* OTP Form */}
        <motion.div
          className="mt-6 xs:mt-8 space-y-5 xs:space-y-6"
          variants={formVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex justify-center space-x-2 xs:space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-10 h-12 xs:w-12 xs:h-14 text-center text-lg xs:text-xl font-semibold border rounded-md ${
                  isLight
                    ? 'border-gray-300 text-gray-900 focus:ring-primary-light focus:border-primary-light bg-white'
                    : 'border-gray-700 text-white focus:ring-primary-dark focus:border-primary-dark bg-gray-800'
                } focus:outline-none focus:ring-2`}
              />
            ))}
          </div>

          <div className="space-y-4">
            {/* Regular Verify Button */}
            {/* <motion.button
              onClick={verifyOtp}
              disabled={isLoading || otp.some(digit => digit === '')}
              whileHover={buttonVariants.hover}
              whileTap={buttonVariants.tap}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs xs:text-sm font-medium rounded-md text-white ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              } ${
                isLight
                  ? 'bg-primary-light hover:bg-blue-600'
                  : 'bg-primary-dark hover:bg-emerald-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLight ? 'focus:ring-primary-light' : 'focus:ring-primary-dark'
              } transition-colors duration-200`}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </motion.button> */}

            {/* Alternative Slide to Verify UI */}
            <div className="flex h-auto items-center justify-center mt-4">
              <div className="w-56">
                {isPoweringOff ? (
                  <div className={`text-center ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
                    <p className="mb-2 text-xl font-light">Verifying...</p>
                  </div>
                ) : (
                  <div
                    ref={constraintsRef}
                    className={`relative h-14 overflow-hidden rounded-full ${
                      isLight ? 'bg-gray-200' : 'bg-gray-700'
                    }`}
                  >
                    <div className="absolute inset-0 left-8 z-0 flex items-center justify-center overflow-hidden">
                      <div ref={textRef} className={`text-md relative w-full text-center font-normal select-none ${
                        isLight ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        Slide to verify
                      </div>
                    </div>
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 168 }}
                      dragElastic={0}
                      dragMomentum={false}
                      onDragEnd={handleDragEnd}
                      animate={controls}
                      style={{ x }}
                      className={`absolute top-1 left-1 z-10 flex h-12 w-12 cursor-grab items-center justify-center rounded-full shadow-md active:cursor-grabbing ${
                        isLight ? 'bg-white' : 'bg-gray-800'
                      }`}
                    >
                      <LogIn size={32} className={`${isLight ? 'text-primary-light' : 'text-primary-dark'}`} />
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row justify-between items-center text-xs xs:text-sm">
            <button
              onClick={handleResendOtp}
              disabled={timer > 0}
              className={`font-medium ${
                timer > 0 ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isLight ? 'text-primary-light hover:text-blue-600' : 'text-primary-dark hover:text-emerald-400'
              }`}
            >
              {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
            </button>

            <Link
              to="/login"
              className={`mt-2 xs:mt-0 flex items-center font-medium ${
                isLight ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ArrowLeft className="h-3 w-3 xs:h-4 xs:w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OTPVerification;
