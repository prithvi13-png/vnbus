import * as React from "react";

import { cn } from "../lib/cn";

export function PublicLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        "min-h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-50",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AuthenticationLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <main className={cn("min-h-screen bg-gray-950 px-4 py-8 text-white", className)}>
      {children}
    </main>
  );
}

export function DashboardLayout({
  children,
  sidebar,
  topbar,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      {sidebar ? <div className="fixed inset-y-0 left-0 hidden lg:block">{sidebar}</div> : null}
      <div className={cn(sidebar && "lg:pl-72")}>
        {topbar}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export const CustomerLayout = DashboardLayout;
export const TravelAgentLayout = DashboardLayout;
export const AdminLayout = DashboardLayout;

export function ErrorLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 px-4 py-10 dark:bg-gray-950">
      {children}
    </main>
  );
}
