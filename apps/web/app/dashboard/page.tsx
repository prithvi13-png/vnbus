import type { Metadata } from "next";

import { DashboardRedirect } from "../../components/dashboard-redirect";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage(): React.JSX.Element {
  return <DashboardRedirect />;
}
