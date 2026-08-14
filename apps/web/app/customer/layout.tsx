import type { Metadata } from "next";

import { CustomerRouteGuard } from "../../components/role-route-guard";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return <CustomerRouteGuard>{children}</CustomerRouteGuard>;
}
