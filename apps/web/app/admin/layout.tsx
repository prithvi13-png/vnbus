import type { Metadata } from "next";

import { AdminRouteGuard } from "../../components/role-route-guard";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return <AdminRouteGuard>{children}</AdminRouteGuard>;
}
