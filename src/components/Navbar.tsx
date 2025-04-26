import { Link } from "react-router-dom";
import { FileText, User, Menu, X, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const { isLight, toggleTheme } = useTheme();

  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const userInfo = user as {
    name: string;
    email: string;
    profilePicture?: string;
  } | null;

  const profileImage =
    userInfo?.profilePicture ||
    "https://cdn-icons-png.flaticon.com/512/668/668709.png";

  const location = useLocation();
  const currentPath = location.pathname;

  // Base styles that apply to both mobile and desktop
  const activeLinkStyle = isLight
    ? "border-b-2 border-primary-light text-primary-light font-semibold"
    : "border-b-2 border-primary-dark text-primary-dark font-semibold";

  const inactiveLinkStyle = isLight
    ? "text-gray-600 hover:text-primary-light"
    : "text-gray-300 hover:text-primary-dark";

  // Desktop link styles
  const linkClass = (path: string) =>
    `pb-1 transition duration-200 select-none ${
      currentPath === path ? activeLinkStyle : inactiveLinkStyle
    }`;

  // Mobile link styles (full width)
  const mobileLinkClass = (path: string) =>
    `w-full py-3 px-4 text-center transition duration-200 select-none ${
      currentPath === path
        ? `${activeLinkStyle} bg-gray-100 dark:bg-gray-800`
        : inactiveLinkStyle
    }`;

  const loginLinkClass = (path: string) =>
    `flex items-center pb-1 transition duration-200 select-none ${
      currentPath === path ? activeLinkStyle : inactiveLinkStyle
    }`;

  const mobileLoginLinkClass = (path: string) =>
    `w-full py-3 px-4 flex justify-center items-center transition duration-200 select-none ${
      currentPath === path
        ? `${activeLinkStyle} bg-gray-100 dark:bg-gray-800`
        : inactiveLinkStyle
    }`;

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close profile dropdown if clicked outside
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }

      // Close mobile menu if clicked outside
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.mobile-menu-button')
      ) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns when auth state changes
  useEffect(() => {
    setShowProfile(false);
    setMobileMenuOpen(false);
  }, [isAuthenticated]);

  // Close mobile menu on window resize (if screen becomes large)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile menu animation variants
  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      }
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full shadow-lg ${
        isLight
          ? "bg-white text-black border-b border-gray-200"
          : "bg-gray-900 text-white border-b border-gray-700"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FileText className={`h-8 w-8 ${isLight ? "text-primary-light" : "text-primary-dark"}`} />
              <span
                className={`text-xl font-bold ${
                  isLight ? "text-gray-800" : "text-gray-200"
                }`}
              >
                SkillSync
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 font-semibold">
            {isAuthenticated ? (
              <>
                <Link to="/templates" className={linkClass("/templates")}>
                  Templates
                </Link>

                <Link to="/dashboard" className={linkClass("/dashboard")}>
                  Dashboard
                </Link>

                <Link to="/editResume" className={linkClass("/editResume")}>
                  Edit Resume
                </Link>

                <Link to="/resumepage" className={linkClass("/resumepage")}>
                  Make Resume
                </Link>

                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isLight ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-800"
                  }`}
                  aria-label="Toggle theme"
                >
                  {isLight ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </button>

                {/* Profile Picture */}
                <div className="relative" ref={profileRef}>
                  <img
                    src={profileImage}
                    alt="Profile"
                    title="Profile"
                    className={`h-10 w-10 rounded-full object-cover border-2 cursor-pointer ${
                      isLight ? "border-primary-light" : "border-primary-dark"
                    }`}
                    onClick={() => setShowProfile((prev) => !prev)}
                  />

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg p-4 z-50 ${
                          isLight
                            ? "bg-white border border-gray-200"
                            : "bg-gray-800 border border-gray-700"
                        }`}
                      >
                        <div className="mb-3">
                          <p className={`font-medium ${isLight ? "text-gray-800" : "text-gray-200"}`}>
                            {userInfo?.name || "User"}
                          </p>
                          <p className={`text-sm ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                            {userInfo?.email || "user@example.com"}
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/templates" className={linkClass("/templates")}>
                  Templates
                </Link>

                <Link to="/login" className={loginLinkClass("/login")}>
                  <User className="h-5 w-5 mr-1" />
                  Login
                </Link>

                <Link to="/signup" className={linkClass("/signup")}>
                  Sign Up
                </Link>

                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isLight ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-800"
                  }`}
                  aria-label="Toggle theme"
                >
                  {isLight ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isLight ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-800"
              }`}
              aria-label="Toggle theme"
            >
              {isLight ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            <button
              className="mobile-menu-button p-2 rounded-md focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className={`h-6 w-6 ${isLight ? "text-gray-800" : "text-gray-200"}`} />
              ) : (
                <Menu className={`h-6 w-6 ${isLight ? "text-gray-800" : "text-gray-200"}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={`md:hidden ${
              isLight ? "bg-white" : "bg-gray-900"
            } border-t ${
              isLight ? "border-gray-200" : "border-gray-700"
            }`}
          >
            <div className="flex flex-col items-center py-2">
              {isAuthenticated ? (
                <>
                  {/* User info for mobile */}
                  <div className={`w-full py-3 px-4 mb-2 flex items-center ${
                    isLight ? "bg-gray-50" : "bg-gray-800"
                  }`}>
                    <img
                      src={profileImage}
                      alt="Profile"
                      className={`h-10 w-10 rounded-full object-cover border-2 mr-3 ${
                        isLight ? "border-primary-light" : "border-primary-dark"
                      }`}
                    />
                    <div>
                      <p className={`font-medium ${isLight ? "text-gray-800" : "text-gray-200"}`}>
                        {userInfo?.name || "User"}
                      </p>
                      <p className={`text-sm ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                        {userInfo?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/templates"
                    className={mobileLinkClass("/templates")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Templates
                  </Link>

                  <Link
                    to="/dashboard"
                    className={mobileLinkClass("/dashboard")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/editResume"
                    className={mobileLinkClass("/editResume")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Edit Resume
                  </Link>

                  <Link
                    to="/resumepage"
                    className={mobileLinkClass("/resumepage")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Make Resume
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 py-3 px-4 bg-red-500 text-white font-medium hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/templates"
                    className={mobileLinkClass("/templates")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Templates
                  </Link>

                  <Link
                    to="/login"
                    className={mobileLoginLinkClass("/login")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className={mobileLinkClass("/signup")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
