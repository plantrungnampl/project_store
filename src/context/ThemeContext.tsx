"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  systemTheme: "light" | "dark" | null;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
  systemTheme: null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "nextstore-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark" | null>(null);

  // Lấy theme từ localStorage khi component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey);
    
    if (storedTheme) {
      setThemeState(storedTheme as Theme);
    }
  }, [storageKey]);

  // Theo dõi theme hệ thống
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const updateSystemTheme = () => {
      const newSystemTheme = mediaQuery.matches ? "dark" : "light";
      setSystemTheme(newSystemTheme);
      
      // Cập nhật document nếu đang sử dụng theme hệ thống
      if (theme === "system") {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(newSystemTheme);
      }
    };

    // Khởi tạo
    updateSystemTheme();

    // Theo dõi thay đổi
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [theme]);

  // Cập nhật theme
  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);

    // Cập nhật class trên document
    const resolvedTheme = newTheme === "system" 
      ? (systemTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) 
      : newTheme;
    
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolvedTheme);
  };

  // Áp dụng theme khi component mount
  useEffect(() => {
    const resolvedTheme = theme === "system" 
      ? (systemTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) 
      : theme;
    
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolvedTheme);
  }, [theme, systemTheme]);

  const resolvedTheme = theme === "system" 
    ? (systemTheme || (typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) 
    : theme;

  const value = {
    theme,
    setTheme,
    resolvedTheme: resolvedTheme as "light" | "dark",
    systemTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
