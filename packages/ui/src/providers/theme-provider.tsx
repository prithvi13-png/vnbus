"use client";

import * as React from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vnbus-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}): React.JSX.Element {
  const [theme, setThemeState] = React.useState<ThemeMode>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as ThemeMode | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    }
  }, [storageKey]);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const nextResolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
    setResolvedTheme(nextResolved);
    document.documentElement.classList.toggle("dark", nextResolved === "dark");
    window.localStorage.setItem(storageKey, theme);
  }, [storageKey, theme]);

  const setTheme = React.useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
