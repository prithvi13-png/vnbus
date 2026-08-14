import * as React from "react";

import { Button } from "../components/button";
import { cn } from "../lib/cn";

export interface TopNavigationProps {
  brand: React.ReactNode;
  nav?: React.ReactNode;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
  className?: string;
}

export function TopNavigation({
  actions,
  brand,
  className,
  nav,
  onMenuClick,
}: TopNavigationProps): React.JSX.Element {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {onMenuClick ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={onMenuClick}
            >
              <span className="h-4 w-4 rounded-sm border-y-2 border-current" aria-hidden="true" />
            </Button>
          ) : null}
          {brand}
        </div>
        {nav ? <div className="hidden md:block">{nav}</div> : null}
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
