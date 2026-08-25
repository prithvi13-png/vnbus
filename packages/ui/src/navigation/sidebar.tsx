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
        "flex h-full min-h-0 w-72 flex-col border-r border-brand-900/40 bg-brand-950 text-white shadow-premium",
        className,
      )}
    >
      <div className="flex h-16 items-center border-b border-white/10 px-5">{brand}</div>
      <nav className="grid flex-1 gap-1 overflow-y-auto p-3" aria-label="Sidebar navigation">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-brand-50/80 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-gold-500",
                item.active &&
                  "bg-gold-500 text-brand-950 shadow-[0_10px_24px_rgba(184,131,39,0.22)] ring-1 ring-gold-300",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
                  {item.badge}
                </span>
              ) : null}
            </a>
          );
        })}
      </nav>
      {footer ? <div className="mt-auto border-t border-white/10 p-4">{footer}</div> : null}
    </aside>
  );
}
