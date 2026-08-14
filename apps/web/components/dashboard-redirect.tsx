"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@vnbus/ui";

import { useAuthStore } from "../lib/auth-store";
import { getDashboardPathForUser } from "../lib/role-routes";

export function DashboardRedirect(): React.JSX.Element {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);

  React.useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user) {
      router.replace("/login?redirect=%2Fdashboard");
      return;
    }

    router.replace(getDashboardPathForUser(user));
  }, [hasHydrated, router, user]);

  return (
    <main className="min-h-screen bg-brand-50 p-6 dark:bg-brand-950">
      <LoadingState
        title="Opening dashboard"
        description="Routing you to the right workspace."
        className="mx-auto max-w-7xl"
      />
    </main>
  );
}
