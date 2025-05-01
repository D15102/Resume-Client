import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Use state to track if we've already processed auth
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    // Skip if we've already processed
    if (processed) return;

    const processAuth = async () => {
      // Set processed state to prevent multiple attempts
      setProcessed(true);

      // Dismiss any loading toasts from the login page
      toast.dismiss('google-auth-loading');

      try {
        console.log('Starting authentication process in AuthCallback');

        // Try to get token from multiple sources
        let token: string | null = null;

        // Debug: Log all cookies and URL
        console.log('Current URL:', window.location.href);
        console.log('All cookies:', document.cookie);

        // 1. Try to get from cookies first (more reliable)
        const cookies = document.cookie.split(';');
        console.log('Cookies found:', cookies.length);

        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          console.log('Checking cookie:', cookie);

          if (cookie.startsWith('temp_auth_token=')) {
            token = cookie.substring('temp_auth_token='.length, cookie.length);
            console.log('Found token in cookies, first 10 chars:', token.substring(0, 10) + '...');
            break;
          }
        }

        // 2. If no token in cookies, try URL hash
        if (!token) {
          const hash = window.location.hash;
          console.log('No token in cookies, checking URL hash:', hash);

          if (hash && hash.includes('token=')) {
            // Get everything after token= and before any other hash parameters
            let hashToken = hash.split('token=')[1];
            if (hashToken && hashToken.includes('&')) {
              hashToken = hashToken.split('&')[0];
            }

            // Decode the URI component
            if (hashToken) {
              try {
                hashToken = decodeURIComponent(hashToken);
                console.log('Found and decoded token from URL hash, first 10 chars:',
                  hashToken.substring(0, 10) + '...');
                token = hashToken;
              } catch (e) {
                console.error('Error decoding token from URL:', e);
              }
            }
          }
        }

        // 3. If still no token, check if we're on a deployed site with a 404 issue
        // This is a special case for Render and similar hosting services
        if (!token && import.meta.env.PROD) {
          console.log('Production environment detected, checking for token in URL path');

          // Check if the token might be in the URL path (due to SPA routing issues)
          const path = window.location.pathname;
          if (path.includes('auth-callback#token=')) {
            console.log('Found token in URL path, extracting...');
            const pathParts = path.split('auth-callback#token=');
            if (pathParts.length > 1) {
              let pathToken = pathParts[1];
              if (pathToken && pathToken.includes('&')) {
                pathToken = pathToken.split('&')[0];
              }

              try {
                pathToken = decodeURIComponent(pathToken);
                console.log('Found and decoded token from URL path, first 10 chars:',
                  pathToken.substring(0, 10) + '...');
                token = pathToken;
              } catch (e) {
                console.error('Error decoding token from URL path:', e);
              }
            }
          }
        }

        // 3. If still no token, try localStorage as a last resort
        // (in case it was stored there in a previous attempt)
        if (!token) {
          const storedToken = localStorage.getItem('temp_auth_token');
          if (storedToken) {
            console.log('Found token in localStorage');
            token = storedToken;
            // Clear it from localStorage after retrieving
            localStorage.removeItem('temp_auth_token');
          }
        }

        // Only clear the cookie if we successfully found and processed the token
        // This prevents clearing it prematurely

        console.log('Final token status:', token ? 'Token found' : 'No token found');

        if (token) {
          try {
            // Decode the JWT to get user info (this is safe as JWT is signed)
            const parts = token.split('.');
            console.log('Token parts length:', parts.length);

            if (parts.length !== 3) {
              throw new Error('Invalid JWT token format');
            }

            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

            // Add padding if needed
            const padding = '='.repeat((4 - base64.length % 4) % 4);
            const paddedBase64 = base64 + padding;

            // Decode base64
            const rawPayload = atob(paddedBase64);

            // Convert to JSON string
            const jsonPayload = decodeURIComponent(
              Array.from(rawPayload)
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );

            console.log('Decoded token payload:', jsonPayload);

            // Parse the JWT payload
            const payload = JSON.parse(jsonPayload);
            const { name, email, profilePicture } = payload;

            console.log('User info from token:', { name, email, profilePicture });

            if (!name || !email) {
              throw new Error('Token missing required user information');
            }

            // Store token and user info directly from the token
            login(token, {
              name,
              email,
              profilePicture
            });

            // Now that we've successfully processed the token, clear the cookie
            document.cookie = 'temp_auth_token=; Max-Age=-99999999; path=/;';

            // Also store the token in localStorage as a backup for future attempts
            // This helps in case the user refreshes the page during authentication
            localStorage.setItem('temp_auth_token', token);

            // Show success toast only once
            toast.success('Successfully logged in with Google!', { id: 'google-login-success' });

            // Navigate to dashboard with a longer delay to ensure state updates in production
            const delay = import.meta.env.PROD ? 1000 : 100;
            console.log(`Using navigation delay of ${delay}ms in ${import.meta.env.PROD ? 'production' : 'development'} mode`);

            // Set a flag in sessionStorage to indicate successful authentication
            sessionStorage.setItem('auth_success', 'true');

            // In production, also store the auth state in sessionStorage
            // This helps with page refreshes and navigation in deployed environments
            if (import.meta.env.PROD) {
              // Store auth data in both localStorage and sessionStorage for redundancy
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify({
                name,
                email,
                profilePicture
              }));

              // Also store in sessionStorage as backup
              sessionStorage.setItem('auth_token', token);
              sessionStorage.setItem('auth_user', JSON.stringify({
                name,
                email,
                profilePicture
              }));
              console.log('Stored authentication data in both localStorage and sessionStorage for production environment');
            }

            setTimeout(() => {
              console.log('Navigation delay completed, redirecting to dashboard');

              // Force a hard navigation to dashboard to ensure clean state
              if (import.meta.env.PROD) {
                try {
                  // In production, use window.location for a full page reload
                  console.log('Using hard navigation in production');

                  // Double-check that auth data is stored before navigation
                  const storedToken = localStorage.getItem('token');
                  const storedUser = localStorage.getItem('user');

                  if (!storedToken || !storedUser) {
                    console.warn('Auth data not found in localStorage before navigation, re-storing...');
                    // Re-store the data
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify({
                      name,
                      email,
                      profilePicture
                    }));
                  }

                  // Navigate to dashboard with absolute URL
                  const baseUrl = window.location.origin;
                  console.log('Base URL for navigation:', baseUrl);
                  window.location.href = `${baseUrl}/dashboard`;

                  // As a fallback, also try setting a redirect flag
                  sessionStorage.setItem('redirect_to_dashboard', 'true');
                } catch (e) {
                  console.error('Error during navigation:', e);
                  // Fallback to React Router
                  navigate('/dashboard');
                }
              } else {
                // In development, use React Router
                console.log('Using React Router navigation in development');
                navigate('/dashboard');
              }
            }, delay);
          } catch (error: any) {
            console.error('Error processing token:', error);
            toast.error(`Authentication failed: ${error.message || 'Unknown error'}`, { id: 'auth-error' });

            // Clear the cookie on error
            document.cookie = 'temp_auth_token=; Max-Age=-99999999; path=/;';

            navigate('/login');
          }
        } else {
          // No token found - don't clear cookies yet, might be a temporary issue
          console.error('No authentication token found');
          toast.error('Authentication failed - No token found in URL or cookies', { id: 'no-token-error' });

          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 100);
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error(`Authentication process failed: ${error.message || 'Unknown error'}`, { id: 'process-error' });
        navigate('/login');
      }
    };

    // Start the auth process
    processAuth();
  }, [login, navigate, processed]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
