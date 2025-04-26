// src/context/ThemeContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type ThemeContextType = {
  isLight: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export  const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isLight, setIsLight] = useState(true);

  const toggleTheme = () => setIsLight((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isLight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

