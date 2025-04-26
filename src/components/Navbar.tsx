import { Link } from "react-router-dom";
import { FileText, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "@theme-toggles/react/css/Classic.css";
import { Classic } from "@theme-toggles/react";
import { useTheme } from "../context/ThemeContext";
const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const { isLight, toggleTheme } = useTheme();

  const userInfo = user as {
    name: string;
    email: string;
    profilePicture?: string;
  };
  const profileImage =
    userInfo?.profilePicture ||
    "https://cdn-icons-png.flaticon.com/512/668/668709.png";

  const location = useLocation();
  const currentPath = location.pathname;

  const linkClass = (path: string) =>
    `pb-1 transition duration-200 ${
      currentPath === path
        ? `${
            isLight
              ? "border-b-2 border-blue-600 text-blue-800 font-semibold select-none"
              : "border-b-2 border-green-500 text-green-500 font-semibold select-none"
          }`
        : `${
            isLight
              ? "text-gray-600 hover:text-blue-800 select-none"
              : "text-zinc-300 hover:text-green-500 select-none"
          }`
    }`;
  const linkClassforLogin = (path: string) =>
    `pb-1 transition duration-200 ${
      currentPath === path
        ? `${
            isLight
              ? "flex justify-evenly border-b-2 border-blue-600 text-blue-800 font-semibold select-none"
              : "flex justify-evenly border-b-2 border-green-500 text-green-500 font-semibold select-none"
          }`
        : `${
            isLight
              ? "flex justify-evenly text-gray-600 hover:text-blue-800 select-none"
              : "flex justify-evenly text-zinc-300 hover:text-green-500 select-none"
          }`
    }`;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !(profileRef.current as any).contains(event.target)
      ) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🛠️ Fix: Close dropdown when auth state changes (e.g., on login)
  useEffect(() => {
    setShowProfile(false);
  }, [isAuthenticated]);

  const [light, setlight] = useState(true);

  return (
    <nav
      className={`${
        isLight
          ? "bg-white text-black border-b-2 "
          : "bg-black text-white border-b-2 border-b-zinc-400"
      } shadow-lg`}
    >
      <div className="max-w-7xl mx-auto px-4 ">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span
                className={`text-xl font-bold
                ${isLight ? "text-gray-800" : "text-zinc-300"}
                `}
              >
                SkillSync
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4 font-semibold relative">
            {/* <Link
              to="/templates"
              className="text-gray-800 hover:text-blue-800"
              title="to Templates"
            >
              Templates
            </Link> */}

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

                <Classic
                  duration={500}
                  toggled={!isLight}
                  onToggle={toggleTheme}
                  className="text-2xl bg-transparent p-2 rounded-3xl"
                />

                {/* Profile Picture */}
                <div className="relative" ref={profileRef}>
                  <img
                    src={profileImage}
                    alt="Profile"
                    title="Profile"
                    className="h-10 w-10 rounded-full object-cover border-2 border-blue-600 cursor-pointer"
                    onClick={() => setShowProfile((prev) => !prev)}
                  />

                  {/* Dropdown */}
                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 transition-all duration-300 z-50">
                      <div className="mb-2">
                        <p className="text-gray-800 font-medium">
                          {userInfo?.name || "John Doe"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {userInfo?.email || "johndoe@example.com"}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/templates" className={linkClass("/templates")}>
                  Templates
                </Link>

                <Link to="/login" className={linkClassforLogin("/login")}>
                  <User className="h-5 w-5 mr-1" />
                  Login
                </Link>
                <Link to="/signup" className={linkClass("/signup")}>
                  Sign Up
                </Link>
                <Classic
                  duration={500}
                  toggled={!isLight}
                  onToggle={toggleTheme}
                  className="text-2xl bg-transparent p-2 rounded-3xl"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
