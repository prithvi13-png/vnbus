import type { Metadata } from "next";

import { DashboardShell } from "../../components/dashboard-shell";
import { OperationsDashboard } from "../../components/dashboard-panels";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage(): React.JSX.Element {
  return (
    <DashboardShell>
      <OperationsDashboard />
    </DashboardShell>
  );
}
