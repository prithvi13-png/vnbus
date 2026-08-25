import type { Metadata } from "next";

import { DashboardShell } from "../../../components/dashboard-shell";
import { AdminSupportOperations } from "../../../components/marketplace-readiness";

export const metadata: Metadata = {
  title: "Support Operations",
};

export default function AdminSupportPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminSupportOperations />
    </DashboardShell>
  );
}
