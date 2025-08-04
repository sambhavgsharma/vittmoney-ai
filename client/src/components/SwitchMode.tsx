"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Types for theme
export type ThemeType = "dark" | "light";

interface SwitchModeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

const SwitchModeContext = createContext<SwitchModeContextProps | undefined>(undefined);

export function SwitchModeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>(
    typeof window !== "undefined" && window.localStorage.getItem("theme") === "light"
      ? "light"
      : "dark"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <SwitchModeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </SwitchModeContext.Provider>
  );
}

export function useSwitchMode() {
  const context = useContext(SwitchModeContext);
  if (!context) {
    throw new Error("useSwitchMode must be used within a SwitchModeProvider");
  }
  return context;
}
