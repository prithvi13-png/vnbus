import type { Metadata } from "next";

import { AgentRouteGuard } from "../../components/role-route-guard";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AgentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return <AgentRouteGuard>{children}</AgentRouteGuard>;
}
