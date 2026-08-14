import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";

export interface NavigationMenuItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  active?: boolean;
}

export function NavigationMenu({
  className,
  items,
}: {
  className?: string;
  items: NavigationMenuItem[];
}): React.JSX.Element {
  return (
    <nav className={cn("flex items-center gap-1", className)} aria-label="Primary navigation">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-50",
              item.active && "bg-blue-50 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200",
            )}
          >
            {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
