import type { Metadata } from "next";

import { AdminReportsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Reports",
};

export default function AdminReportsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminReportsWorkspace />
    </DashboardShell>
  );
}
