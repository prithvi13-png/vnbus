import type { Metadata } from "next";

import { AdminAgentsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Agents",
};

export default function AdminAgentsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminAgentsWorkspace />
    </DashboardShell>
  );
}
