"use client";

import { Moon, Sun } from "lucide-react";
import { Button, useTheme } from "@vnbus/ui";

export function ThemeToggle(): React.JSX.Element {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Use light theme" : "Use dark theme"}
      onClick={toggleTheme}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}
