"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_ROLE } from "@vnbus/shared";
import { LoadingState } from "@vnbus/ui";

import { useAuthStore } from "../lib/auth-store";

export function AdminRouteGuard({ children }: { children: React.ReactNode }): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user ? user.role === ADMIN_ROLE || user.roles.includes(ADMIN_ROLE) : false;

  React.useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user) {
      const redirect = encodeURIComponent(pathname ?? "/admin/dashboard");
      router.replace(`/login?redirect=${redirect}`);
      return;
    }

    if (!isAdmin) {
      router.replace("/unauthorized");
    }
  }, [hasHydrated, isAdmin, pathname, router, user]);

  if (!hasHydrated || !user || !isAdmin) {
    return (
      <main className="min-h-screen bg-brand-50 p-6 dark:bg-brand-950">
        <LoadingState
          title="Checking access"
          description="Confirming admin workspace permissions."
          className="mx-auto max-w-7xl"
        />
      </main>
    );
  }

  return <>{children}</>;
}
