"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_ROLE, CUSTOMER_ROLE, TRAVEL_AGENT_ROLE } from "@vnbus/shared";
import type { UserRole } from "@vnbus/types";
import { LoadingState } from "@vnbus/ui";

import { useAuthStore } from "../lib/auth-store";
import { userHasRole } from "../lib/role-routes";

type RoleRouteGuardProps = {
  allowedRoles: UserRole[];
  areaLabel: string;
  children: React.ReactNode;
};

export function RoleRouteGuard({
  allowedRoles,
  areaLabel,
  children,
}: RoleRouteGuardProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const canAccess = user ? allowedRoles.some((role) => userHasRole(user, role)) : false;

  React.useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user) {
      const redirect = encodeURIComponent(pathname ?? "/dashboard");
      router.replace(`/login?redirect=${redirect}`);
      return;
    }

    if (!canAccess) {
      router.replace("/unauthorized");
    }
  }, [canAccess, hasHydrated, pathname, router, user]);

  if (!hasHydrated || !user || !canAccess) {
    return (
      <main className="min-h-screen bg-brand-50 p-6 dark:bg-brand-950">
        <LoadingState
          title={`Checking ${areaLabel} access`}
          description={`Confirming ${areaLabel} workspace permissions.`}
          className="mx-auto max-w-7xl"
        />
      </main>
    );
  }

  return <>{children}</>;
}

export function AdminRouteGuard({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <RoleRouteGuard allowedRoles={[ADMIN_ROLE]} areaLabel="admin">
      {children}
    </RoleRouteGuard>
  );
}

export function CustomerRouteGuard({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <RoleRouteGuard allowedRoles={[CUSTOMER_ROLE]} areaLabel="customer">
      {children}
    </RoleRouteGuard>
  );
}

export function AgentRouteGuard({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <RoleRouteGuard allowedRoles={[TRAVEL_AGENT_ROLE]} areaLabel="agent">
      {children}
    </RoleRouteGuard>
  );
}
