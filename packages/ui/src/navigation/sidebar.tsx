import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: string;
}

export interface SidebarProps {
  brand: React.ReactNode;
  items: SidebarItem[];
  footer?: React.ReactNode;
  className?: string;
}

export function Sidebar({ brand, className, footer, items }: SidebarProps): React.JSX.Element {
  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950",
        className,
      )}
    >
      <div className="flex h-16 items-center border-b border-gray-200 px-5 dark:border-gray-800">
        {brand}
      </div>
      <nav className="grid gap-1 p-3" aria-label="Sidebar navigation">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-50",
                item.active && "bg-blue-50 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {item.badge}
                </span>
              ) : null}
            </a>
          );
        })}
      </nav>
      {footer ? (
        <div className="mt-auto border-t border-gray-200 p-4 dark:border-gray-800">{footer}</div>
      ) : null}
    </aside>
  );
}
