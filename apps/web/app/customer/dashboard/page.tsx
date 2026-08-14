import type { Metadata } from "next";

import { DashboardShell } from "../../../components/dashboard-shell";
import { CustomerDashboard } from "../../../components/dashboard-panels";

export const metadata: Metadata = {
  title: "Customer Dashboard",
};

export default function CustomerDashboardPage(): React.JSX.Element {
  return (
    <DashboardShell area="customer">
      <CustomerDashboard />
    </DashboardShell>
  );
}
