// src/context/ThemeContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeContextType = {
  isLight: boolean;
  toggleTheme: () => void;
  isDark: boolean; // Added for convenience
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = (): boolean => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "light";
    }
    // Check system preference
    return !window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [isLight, setIsLight] = useState(getInitialTheme);

  const toggleTheme = () => {
    setIsLight((prev) => {
      const newTheme = !prev;
      // Save to localStorage
      localStorage.setItem("theme", newTheme ? "light" : "dark");
      return newTheme;
    });
  };

  // Apply theme to document when it changes
  useEffect(() => {
    // Toggle dark/light classes
    document.documentElement.classList.toggle("dark", !isLight);
    document.documentElement.classList.toggle("light", isLight);

    // Set CSS variables for components like Toaster
    if (isLight) {
      document.documentElement.style.setProperty('--toaster-bg', '#fff');
      document.documentElement.style.setProperty('--toaster-color', '#333');
      document.documentElement.style.setProperty('--toaster-success-bg', '#10b981');
      document.documentElement.style.setProperty('--toaster-success-color', '#fff');
      document.documentElement.style.setProperty('--toaster-error-bg', '#ef4444');
      document.documentElement.style.setProperty('--toaster-error-color', '#fff');
    } else {
      document.documentElement.style.setProperty('--toaster-bg', '#1f2937');
      document.documentElement.style.setProperty('--toaster-color', '#f3f4f6');
      document.documentElement.style.setProperty('--toaster-success-bg', '#065f46');
      document.documentElement.style.setProperty('--toaster-success-color', '#ecfdf5');
      document.documentElement.style.setProperty('--toaster-error-bg', '#7f1d1d');
      document.documentElement.style.setProperty('--toaster-error-color', '#fef2f2');
    }
  }, [isLight]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem("theme")) {
        setIsLight(!mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ isLight, isDark: !isLight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

