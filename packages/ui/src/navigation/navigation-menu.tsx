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
              "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-900 focus:outline-none focus:ring-2 focus:ring-gold-500 dark:text-brand-100 dark:hover:bg-brand-900 dark:hover:text-white",
              item.active &&
                "bg-gold-50 text-brand-900 ring-1 ring-gold-200 dark:bg-gold-500/10 dark:text-gold-100",
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
