"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { safeLocalStorage } from "@/lib/safeLocalStorage";

// Types for theme
export type ThemeType = "dark" | "light";

interface SwitchModeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

const SwitchModeContext = createContext<SwitchModeContextProps | undefined>(undefined);

export function SwitchModeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage only on client
  useEffect(() => {
    const savedTheme = safeLocalStorage.get("theme") === "light" ? "light" : "dark";
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  // Update DOM and localStorage when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    safeLocalStorage.set("theme", theme);
  }, [theme, mounted]);

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
