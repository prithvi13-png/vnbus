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
        "flex h-full w-72 flex-col border-r border-gold-100 bg-white dark:border-brand-900 dark:bg-brand-950",
        className,
      )}
    >
      <div className="flex h-16 items-center border-b border-gold-100 px-5 dark:border-brand-900">
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
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-900 focus:outline-none focus:ring-2 focus:ring-gold-500 dark:text-brand-100 dark:hover:bg-brand-900 dark:hover:text-white",
                item.active &&
                  "bg-gold-50 text-brand-900 ring-1 ring-gold-200 dark:bg-gold-500/10 dark:text-gold-100",
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
        <div className="mt-auto border-t border-gold-100 p-4 dark:border-brand-900">{footer}</div>
      ) : null}
    </aside>
  );
}
