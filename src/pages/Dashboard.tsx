import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import emailjs from "@emailjs/browser";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
// Import our custom styles for driver.js
import "../styles/driver-custom.css";

// Resume score interface
interface ResumeScore {
  atsScore: number;
  suggestions: string[];
  keywords: string[];
  strengths: string[];
  areaforImprovement: string[];
  specificSuggestions: string[];
  jobRole: string[];
}

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  // Use empty string to use the proxy configured in vite.config.ts
  const serverUrl = import.meta.env.VITE_SERVER_URL || "";

  const { isLight } = useTheme();
  const { isAuthenticated, user } = useAuth() as {
    isAuthenticated: boolean;
    user: { name?: string; email?: string; profilePicture?: string } | null;
  };
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState<ResumeScore | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [tourShown, setTourShown] = useState(false);

  // Function to check if the tour has been completed
  const hasTourBeenCompleted = () => {
    const completed = localStorage.getItem('dashboard_tour_completed') === 'true';
    console.log('Checking if tour completed:', completed, 'Value in localStorage:', localStorage.getItem('dashboard_tour_completed'));
    return completed;
  };

  // Function to reset the tour completion status (for testing)
  const resetTourStatus = () => {
    localStorage.removeItem('dashboard_tour_completed');
    setTourShown(false);
    console.log('Tour status reset, will show on next visit');
  };

  // Function to start the tour manually or automatically
  const startTour = (source = "manual", forceShow = false) => {
    // Prevent showing the tour multiple times in the same session
    if (tourShown && source === "default-auto-start") {
      console.log("Tour already shown in this session, not showing again");
      return;
    }

    // For default auto-start, we want to show the tour by default
    // but not show it again if the user has completed it before
    if (source === "default-auto-start" && hasTourBeenCompleted()) {
      console.log("Tour already completed, not showing again for default auto-start");
      return;
    }

    // For other sources, respect the forceShow parameter
    if (!forceShow && source !== "button-click" && hasTourBeenCompleted()) {
      console.log("Tour already completed, not showing again");
      return;
    }

    console.log(`Starting dashboard tour (source: ${source})`);

    // Mark that the tour has been shown in this session
    setTourShown(true);

    try {
      // Check if elements exist before starting tour
      const welcomeElement = document.getElementById("dashboard-welcome");
      const uploadElement = document.querySelector(".upload-container");
      const logoElement = document.querySelector(".navbar-logo");
      const homeButtonElement = document.querySelector(".visit-home-page");

      if (!welcomeElement || !uploadElement) {
        console.warn("Some tour elements are not available yet. Delaying tour...");
        // Retry after a longer delay if elements aren't ready
        setTimeout(() => startTour("delayed", forceShow), 2000);
        return;
      }

      // Function to open the profile dropdown
      const openProfileDropdown = () => {
        try {
          const profilePic = document.querySelector('.profile-picture');
          if (profilePic) {
            (profilePic as HTMLElement).click();
            console.log('Clicked profile picture to open dropdown');
            return true;
          }
        } catch (error) {
          console.error('Error clicking profile picture:', error);
        }
        return false;
      };

      // Create driver instance
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        stagePadding: 10,
        nextBtnText: 'Next',
        prevBtnText: 'Previous',
        doneBtnText: 'Got it!',
        allowClose: true, // Allow users to close the tour when they want
        showButtons: ['next', 'previous', 'close'], // Include close button in the UI
        onHighlightStarted: (element) => {
          // If we're highlighting the logout button, make sure the profile dropdown is open
          if (element && element.classList.contains('logout-button')) {
            openProfileDropdown();
          }
        },
        steps: [
          {
            element: "#dashboard-welcome",
            popover: {
              title: "Welcome to SkillSync!",
              description: "This is your dashboard where you can analyze and improve your resume.<br><br><em>You can close this tour at any time by clicking the X button or pressing ESC.</em>"
            },
          },
          {
            element: ".upload-container",
            popover: {
              title: "Upload Your Resume",
              description: "Drag and drop your resume file here or click to browse files. We support PDF, DOC, and DOCX formats."
            },
          },
          // Only add logo step if element exists
          ...(logoElement ? [{
            element: ".navbar-logo",
            popover: {
              title: "Navigation",
              description: "Click on the logo anytime to return to the home page."
            },
          }] : []),
          // Only add home button step if element exists
          ...(homeButtonElement ? [{
            element: ".visit-home-page",
            popover: {
              title: "Home Page Access",
              description: "You can also use this button to visit the home page while keeping your session active."
            },
          }] : []),
          // Add profile picture step
          {
            element: ".profile-picture",
            popover: {
              title: "Your Profile",
              description: "Click on your profile picture to access account options and sign out."
            }
          },
          // Add logout button step (will be shown after clicking profile picture)
          {
            element: ".logout-button",
            popover: {
              title: "Sign Out",
              description: "Click here to sign out of your account when you're done."
            },
          },
        ],
        onDeselected: (element) => {
          console.log('Tour step completed for', element);

          // If we're on the profile picture step, open the dropdown for the next step
          if (element && element.classList.contains('profile-picture')) {
            openProfileDropdown();
          }
        },
        onDestroyed: () => {
          // Mark the tour as completed when it's closed or completed
          localStorage.setItem('dashboard_tour_completed', 'true');
          console.log('Tour completed and marked in localStorage:', localStorage.getItem('dashboard_tour_completed'));

          // Also update the state to prevent showing the tour again in this session
          setTourShown(true);

          // Show a toast message if the tour was closed manually
          // toast.success("Tour closed. You can restart it anytime from the dashboard.", {
          //   duration: 900,
          //   id: "tour-closed"
          // });
        },
        onCloseClick: () => {
          // Mark the tour as completed when manually closed
          localStorage.setItem('dashboard_tour_completed', 'true');
          console.log('Tour manually closed and marked as completed');

          // Update the state to prevent showing the tour again in this session
          setTourShown(true);

          // Actually close the tour when X is clicked
          driverObj.destroy();

          // Show a toast message
          // toast.success("Tour closed. You can restart it anytime from the dashboard.", {
          //   duration: 3000,
          //   id: "tour-closed"
          // });
        }
      });

      // Add keyboard shortcut (ESC) to close the tour
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          driverObj.destroy();
          // Remove the event listener after the tour is closed
          document.removeEventListener('keydown', handleKeyDown);
        }
      };

      // Add the event listener
      document.addEventListener('keydown', handleKeyDown);

      // Start the tour
      driverObj.drive();
    } catch (error) {
      console.error("Error starting tour:", error);
    }
  };



  // Function to send welcome email
  const sendWelcomeEmail = async (name: string, email: string) => {
    if (emailSent) return; // Prevent multiple emails

    try {
      console.log("Dashboard: Sending welcome email to:", email);

      // Initialize EmailJS
      emailjs.init("C9rw1HuEBWiPQBXxZ");

      // Send welcome email
      await emailjs.send(
        "service_zs8dfds", // Your EmailJS service ID
        "template_ixw0fad", // Your EmailJS template ID
        {
          name: name,
          email: email,
        }
      );

      console.log("Dashboard: Welcome email sent successfully");
      setEmailSent(true);
      toast.success("Welcome email sent!", {
        id: "dashboard-email-success",
        duration: 5000,
      });
    } catch (error) {
      console.error("Dashboard: Error sending welcome email:", error);
      toast.error("Could not send welcome email. Please try again later.", {
        id: "dashboard-email-error",
      });
    }
  };

  // Start the tour automatically when the component mounts
  useEffect(() => {
    console.log("Dashboard: Component mounted, checking if tour should be shown");

    // Check if the tour has been completed before
    const tourCompleted = localStorage.getItem('dashboard_tour_completed') === 'true';
    console.log("Tour completed status on mount:", tourCompleted);

    if (!tourCompleted) {
      console.log("Tour not completed, will show by default");

      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        // Show the tour by default for first-time visitors
        startTour('default-auto-start', true);
      }, 1500);
    } else {
      console.log("Tour already completed, won't show by default");
    }
  }, []);

  // Check for auth_success flag in sessionStorage (set by AuthCallback)
  useEffect(() => {
    console.log("Dashboard: Checking authentication flags");
    const authSuccess = sessionStorage.getItem("auth_success");
    const isFirstLogin = sessionStorage.getItem("is_first_login");

    console.log("Dashboard: Auth success flag =", authSuccess);
    console.log("Dashboard: Is first login flag =", isFirstLogin);

    if (authSuccess === "true") {
      // Clear the flag
      sessionStorage.removeItem("auth_success");
      console.log("Dashboard: Cleared auth_success flag");

      // Show different welcome message based on first login status
      if (isFirstLogin === "true") {
        // Clear the first login flag
        sessionStorage.removeItem("is_first_login");
        console.log("Dashboard: Cleared is_first_login flag");

        // Show special welcome message for first-time users
        toast.success(
          "Welcome to SkillSync! We're sending you a welcome email.",
          {
            id: "first-login-welcome",
            duration: 6000,
          }
        );
        console.log("Dashboard: Showed first-time user welcome message");
        // First login detected - no need to start tour here as it's started by default
        // Try to send welcome email if we have user data
        if (user && user.name && user.email) {
          sendWelcomeEmail(user.name, user.email);
        } else {
          // Try to get user data from localStorage
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              if (userData.name && userData.email) {
                sendWelcomeEmail(userData.name, userData.email);
              }
            } catch (e) {
              console.error("Dashboard: Error parsing user data for email:", e);
            }
          }
        }
      } else {
        // Show regular welcome message for returning users
        toast.success("Welcome back to your dashboard!", {
          id: "dashboard-welcome",
          duration: 3000,
        });
        console.log("Dashboard: Showed returning user welcome message");

        // Returning user detected - no need to start tour here as it's started by default
      }
    } else {
      // Check localStorage as a fallback
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          console.log("Dashboard: User data from localStorage:", userData);

          // Try to decode the JWT token to check for isFirstLogin
          try {
            const parts = storedToken.split(".");
            if (parts.length === 3) {
              const base64Url = parts[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

              // Add padding if needed
              const padding = "=".repeat((4 - (base64.length % 4)) % 4);
              const paddedBase64 = base64 + padding;

              // Decode base64
              const rawPayload = atob(paddedBase64);

              // Convert to JSON string
              const jsonPayload = decodeURIComponent(
                Array.from(rawPayload)
                  .map(
                    (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                  )
                  .join("")
              );

              // Parse the JWT payload
              const payload = JSON.parse(jsonPayload);
              console.log("Dashboard: Token payload:", payload);

              // Check for isFirstLogin flag
              if (payload.isFirstLogin === true) {
                console.log(
                  "Dashboard: First login detected from token payload"
                );

                // Show special welcome message for first-time users
                toast.success(
                  "Welcome to SkillSync! We're sending you a welcome email.",
                  {
                    id: "first-login-welcome-from-token",
                    duration: 6000,
                  }
                );

                // Set the flag in sessionStorage for future reference
                sessionStorage.setItem("is_first_login", "true");

                // Try to send welcome email if we have user data
                if (userData.name && userData.email) {
                  sendWelcomeEmail(userData.name, userData.email);
                }
              }

              // Token-loaded user detected - no need to start tour here as it's started by default
            }
          } catch (tokenError) {
            console.error("Dashboard: Error decoding token:", tokenError);
          }
        } catch (e) {
          console.error("Dashboard: Error parsing user data:", e);

          // Error parsing user data - no need to start tour here as it's started by default
        }
      } else {
        // No stored user data - no need to start tour here as it's started by default
        console.log("No stored user data detected");
      }
    }

    // Verify authentication
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    analyzeResume(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
  });

  const analyzeResume = async (file: File) => {
    setAnalyzing(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${serverUrl}/api/resume/analyze`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type when using FormData, browser will set it automatically with boundary
        },
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setScore(data);
        toast.success("Resume analyzed successfully!");
      } else {
        toast.error(data.message || "Failed to analyze resume");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error("Resume analysis error:", error);
      toast.error(
        "An error occurred while analyzing the resume. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEditResume = () => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      // If it's PDF, we send a DataURL (base64) to preview as embedded viewer
      const isPDF = file.type === "application/pdf";
      const isDocx = file.type.includes("word");

      // Format for tracking
      const format = isPDF ? "pdf" : isDocx ? "docx" : "text";

      // For PDF files, we'll still use the EditResume component which has the PDF viewer
      // and conversion option. For other file types, we'll use the appropriate editor.
      navigate("/editResume", {
        state: {
          name: file.name,
          type: file.type,
          content: result,
          format: format,
        },
      });
    };

    const isPDF = file.type === "application/pdf";
    const isDocx = file.type.includes("word");

    if (isPDF) {
      reader.readAsDataURL(file); // for previewing PDF
    } else if (isDocx) {
      reader.readAsArrayBuffer(file); // for converting DOCX later
    } else {
      reader.readAsText(file); // for txt, etc.
    }
  };

  return (
    <motion.div
      className={`${
        isLight ? "bg-gray-50" : "bg-gray-900 text-white"
      } min-h-[calc(100vh-4.1rem)]`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5 }}
    >
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <motion.div
          initial={{ x: "-50%", y: "-50%", opacity: 0.3 }}
          animate={{ x: "150%", y: "100px", opacity: 0 }}
          transition={{ duration: 5, ease: "easeInOut" }}
          className="absolute w-[200px] xs:w-[300px] sm:w-[500px] h-[200px] xs:h-[300px] sm:h-[500px] bg-gradient-to-r from-blue-400 to-green-400 dark:from-blue-600 dark:to-green-600 rounded-full filter blur-3xl opacity-20 z-0"
          style={{ top: "-10%", left: "-10%" }}
        />

        <div className="max-w-6xl mx-auto px-3 xs:px-4 py-6 xs:py-8 md:py-12 relative z-10">
          {/* Welcome message */}
          <motion.div
            id="dashboard-welcome"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`mb-6 p-4 rounded-lg ${
              isLight ? "bg-blue-50" : "bg-gray-800"
            } border ${isLight ? "border-blue-200" : "border-gray-700"}`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h2
                  className={`text-lg xs:text-xl font-bold ${
                    isLight ? "text-gray-800" : "text-white"
                  }`}
                >
                  Welcome to your Dashboard!
                </h2>
                <p
                  className={`text-sm xs:text-base ${
                    isLight ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  This is where you can analyze and improve your resume.
                </p>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 mt-3 sm:mt-0">
                <button
                  onClick={() => startTour('button-click', true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isLight
                      ? "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                      : "bg-gray-700 text-blue-400 border border-blue-400 hover:bg-gray-600"
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Take Tour
                  </span>
                </button>
                {/* Hidden buttons for testing */}
                <div className="hidden">
                  <button
                    onClick={resetTourStatus}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded mr-2"
                  >
                    Reset Tour
                  </button>
                  <button
                    onClick={() => {
                      const status = localStorage.getItem('dashboard_tour_completed');
                      alert(`Tour status: ${status || 'not set'}\nTour shown in session: ${tourShown}`);
                    }}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                  >
                    Check Status
                  </button>
                </div>
                <Link
                  to="/"
                  className={`visit-home-page px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isLight
                      ? "bg-white text-primary-light border border-primary-light hover:bg-blue-50"
                      : "bg-gray-700 text-primary-dark border border-primary-dark hover:bg-gray-600"
                  }`}
                >
                  Visit Home Page
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl xs:text-2xl sm:text-3xl md:text-4xl text-center font-bold mb-4 xs:mb-6 md:mb-8"
          >
            Upload Your Resume
          </motion.h1>

          <div className="mt-4 xs:mt-6 md:mt-10">
            <div
              {...getRootProps()}
              className={`upload-container mb-4 xs:mb-6 md:mb-10 border-2 border-dashed rounded-lg p-4 xs:p-6 md:p-10 text-center select-none cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? isLight
                    ? "border-primary-light bg-blue-50"
                    : "border-primary-dark bg-gray-800"
                  : isLight
                  ? "border-gray-300 hover:border-primary-light"
                  : "border-gray-700 hover:border-primary-dark"
              }`}
            >
              <input {...getInputProps()} />
              <Upload
                className={`mx-auto h-8 w-8 xs:h-10 xs:w-10 md:h-12 md:w-12 ${
                  isLight ? "text-primary-light" : "text-primary-dark"
                }`}
              />
              <p
                className={`mt-3 xs:mt-4 text-sm xs:text-base md:text-lg font-medium ${
                  isLight ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Drag & drop your resume here, or click to select
              </p>
              <p
                className={`mt-1 xs:mt-2 text-xs xs:text-sm ${
                  isLight ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Supported formats: PDF, DOC, DOCX
              </p>
            </div>

            {/* File preview */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm xs:text-base md:text-lg mt-3 xs:mt-4 p-3 xs:p-4 rounded-lg shadow-md ${
                  isLight ? "bg-white" : "bg-gray-800"
                }`}
              >
                <div className="flex items-center">
                  <FileText
                    className={`h-5 w-5 xs:h-6 xs:w-6 md:h-7 md:w-7 ${
                      isLight ? "text-primary-light" : "text-primary-dark"
                    } mr-1.5 xs:mr-2`}
                  />
                  <span
                    className={`truncate text-sm xs:text-base ${
                      isLight ? "text-gray-700" : "text-white"
                    }`}
                  >
                    {file.name}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Loading state */}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 xs:mt-6 md:mt-8 p-3 xs:p-4 md:p-6 rounded-lg shadow-md animate-pulse space-y-3 xs:space-y-4 md:space-y-6 ${
                isLight ? "bg-white" : "bg-gray-800"
              }`}
            >
              <div>
                <div
                  className={`h-4 xs:h-5 md:h-6 ${
                    isLight ? "bg-gray-200" : "bg-gray-700"
                  } rounded w-1/4 mb-1 xs:mb-2`}
                />
                <div
                  className={`h-2 xs:h-2.5 md:h-3 ${
                    isLight ? "bg-gray-100" : "bg-gray-600"
                  } rounded w-full`}
                />
              </div>

              <div>
                <div
                  className={`h-3 xs:h-4 md:h-5 ${
                    isLight ? "bg-gray-200" : "bg-gray-700"
                  } rounded w-1/3 mb-1 xs:mb-2`}
                />
                <div className="space-y-1 xs:space-y-1.5 md:space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 xs:h-3 md:h-4 ${
                        isLight ? "bg-gray-100" : "bg-gray-600"
                      } rounded w-full`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div
                  className={`h-3 xs:h-4 md:h-5 ${
                    isLight ? "bg-gray-200" : "bg-gray-700"
                  } rounded w-1/3 mb-1 xs:mb-2`}
                />
                <div className="space-y-1 xs:space-y-1.5 md:space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 xs:h-3 md:h-4 ${
                        isLight ? "bg-gray-100" : "bg-gray-600"
                      } rounded w-3/4`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div
                  className={`h-3 xs:h-4 md:h-5 ${
                    isLight ? "bg-gray-200" : "bg-gray-700"
                  } rounded w-1/4 mb-1 xs:mb-2`}
                />
                <div className="flex gap-1 xs:gap-1.5 md:gap-2 flex-wrap">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 xs:h-5 md:h-6 w-10 xs:w-12 md:w-16 ${
                        isLight ? "bg-gray-100" : "bg-gray-600"
                      } rounded-full`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <div
                  className={`h-6 xs:h-8 md:h-10 w-20 xs:w-24 md:w-32 ${
                    isLight ? "bg-gray-200" : "bg-gray-700"
                  } rounded-lg`}
                />
              </div>
            </motion.div>
          )}

          {/* Results */}
          {!analyzing && score && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`mt-4 xs:mt-6 md:mt-8 p-3 xs:p-4 md:p-6 rounded-lg shadow-md ${
                isLight ? "bg-white" : "bg-gray-800"
              }`}
            >
              <h2
                className={`text-lg xs:text-xl md:text-2xl font-bold mb-3 xs:mb-4 md:mb-6 ${
                  isLight ? "text-gray-800" : "text-white"
                }`}
              >
                Analysis Results
              </h2>

              {/* ATS Score */}
              <div className="mb-4 xs:mb-6 md:mb-8">
                <div className="flex items-center justify-between mb-1 xs:mb-2">
                  <span
                    className={`text-sm xs:text-base font-semibold ${
                      isLight ? "text-gray-700" : "text-gray-200"
                    }`}
                  >
                    ATS Score
                  </span>
                  <span
                    className={`text-lg xs:text-xl md:text-2xl font-bold ${
                      isLight ? "text-primary-light" : "text-primary-dark"
                    }`}
                  >
                    {score.atsScore}%
                  </span>
                </div>
                <div
                  className={`w-full ${
                    isLight ? "bg-gray-200" : "bg-gray-700"
                  } rounded-full h-1.5 xs:h-2 md:h-2.5`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score.atsScore}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-1.5 xs:h-2 md:h-2.5 rounded-full ${
                      isLight ? "bg-sunset-glow" : "bg-dark-sunset-glow"
                    } bg-400 animate-bg-move`}
                  />
                </div>
              </div>

              {/* Tabs for different sections */}
              <div className="mb-3 xs:mb-4 md:mb-6">
                <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      const element = document.getElementById("suggestions");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`mr-1 xs:mr-2 py-1.5 xs:py-2 px-2 xs:px-3 md:px-4 text-xs xs:text-sm md:text-base font-medium rounded-t-lg ${
                      isLight
                        ? "text-primary-light hover:bg-gray-50"
                        : "text-primary-dark hover:bg-gray-700"
                    }`}
                  >
                    Suggestions
                  </button>
                  <button
                    onClick={() => {
                      const element = document.getElementById("strengths");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`mr-1 xs:mr-2 py-1.5 xs:py-2 px-2 xs:px-3 md:px-4 text-xs xs:text-sm md:text-base font-medium rounded-t-lg ${
                      isLight
                        ? "text-primary-light hover:bg-gray-50"
                        : "text-primary-dark hover:bg-gray-700"
                    }`}
                  >
                    Strengths
                  </button>
                  <button
                    onClick={() => {
                      const element = document.getElementById("keywords");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`py-1.5 xs:py-2 px-2 xs:px-3 md:px-4 text-xs xs:text-sm md:text-base font-medium rounded-t-lg ${
                      isLight
                        ? "text-primary-light hover:bg-gray-50"
                        : "text-primary-dark hover:bg-gray-700"
                    }`}
                  >
                    Keywords
                  </button>
                </div>
              </div>

              {/* Suggestions Section */}
              <div
                id="suggestions"
                className="mb-4 xs:mb-6 md:mb-8 scroll-mt-16 xs:scroll-mt-20"
              >
                <h3
                  className={`text-base xs:text-lg md:text-xl font-semibold mb-2 xs:mb-3 ${
                    isLight ? "text-gray-800" : "text-white"
                  }`}
                >
                  Suggestions
                </h3>
                <ul className="space-y-2 xs:space-y-3">
                  {score.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle
                        className={`h-4 w-4 xs:h-5 xs:w-5 ${
                          isLight ? "text-amber-500" : "text-amber-400"
                        } mr-1.5 xs:mr-2 flex-shrink-0 mt-0.5`}
                      />
                      <span
                        className={`text-xs xs:text-sm md:text-base ${
                          isLight ? "text-gray-700" : "text-gray-200"
                        }`}
                      >
                        {suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strengths Section */}
              <div
                id="strengths"
                className="mb-4 xs:mb-6 md:mb-8 scroll-mt-16 xs:scroll-mt-20"
              >
                <h3
                  className={`text-base xs:text-lg md:text-xl font-semibold mb-2 xs:mb-3 ${
                    isLight ? "text-gray-800" : "text-white"
                  }`}
                >
                  Strengths
                </h3>
                <ul className="space-y-2 xs:space-y-3">
                  {score.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle
                        className={`h-4 w-4 xs:h-5 xs:w-5 ${
                          isLight ? "text-green-500" : "text-green-400"
                        } mr-1.5 xs:mr-2 flex-shrink-0 mt-0.5`}
                      />
                      <span
                        className={`text-xs xs:text-sm md:text-base ${
                          isLight ? "text-gray-700" : "text-gray-200"
                        }`}
                      >
                        {strength}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Specific Suggestions */}
              <div className="mb-4 xs:mb-6 md:mb-8 scroll-mt-16 xs:scroll-mt-20">
                <h3
                  className={`text-base xs:text-lg md:text-xl font-semibold mb-2 xs:mb-3 ${
                    isLight ? "text-gray-800" : "text-white"
                  }`}
                >
                  Specific Suggestions
                </h3>
                <ul className="space-y-2 xs:space-y-3">
                  {score.specificSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle
                        className={`h-4 w-4 xs:h-5 xs:w-5 ${
                          isLight ? "text-blue-500" : "text-blue-400"
                        } mr-1.5 xs:mr-2 flex-shrink-0 mt-0.5`}
                      />
                      <span
                        className={`text-xs xs:text-sm md:text-base ${
                          isLight ? "text-gray-700" : "text-gray-200"
                        }`}
                      >
                        {suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Job Roles */}
              <div className="mb-4 xs:mb-6 md:mb-8 scroll-mt-16 xs:scroll-mt-20">
                <h3
                  className={`text-base xs:text-lg md:text-xl font-semibold mb-2 xs:mb-3 ${
                    isLight ? "text-gray-800" : "text-white"
                  }`}
                >
                  Suitable Job Roles
                </h3>
                <ul className="space-y-2 xs:space-y-3">
                  {score.jobRole.map((role, index) => (
                    <li key={index} className="flex items-start">
                      <FileText
                        className={`h-4 w-4 xs:h-5 xs:w-5 ${
                          isLight ? "text-purple-500" : "text-purple-400"
                        } mr-1.5 xs:mr-2 flex-shrink-0 mt-0.5`}
                      />
                      <span
                        className={`text-xs xs:text-sm md:text-base ${
                          isLight ? "text-gray-700" : "text-gray-200"
                        }`}
                      >
                        {role}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keywords */}
              <div
                id="keywords"
                className="mb-4 xs:mb-6 md:mb-8 scroll-mt-16 xs:scroll-mt-20"
              >
                <h3
                  className={`text-base xs:text-lg md:text-xl font-semibold mb-2 xs:mb-3 ${
                    isLight ? "text-gray-800" : "text-white"
                  }`}
                >
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-1 xs:gap-1.5 md:gap-2">
                  {score.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className={`px-2 xs:px-3 py-0.5 xs:py-1 text-xs xs:text-sm rounded-full ${
                        isLight
                          ? "bg-blue-100 text-blue-800"
                          : "bg-blue-900 text-blue-100"
                      }`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 xs:mt-6 md:mt-8 flex justify-end">
                <button
                  onClick={handleEditResume}
                  className={`px-3 xs:px-4 py-1.5 xs:py-2 md:px-6 md:py-3 rounded-lg text-white text-xs xs:text-sm font-medium transition-colors ${
                    isLight
                      ? "bg-primary-light hover:bg-blue-600"
                      : "bg-primary-dark hover:bg-emerald-600"
                  }`}
                  disabled={!file}
                >
                  Edit Resume
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
