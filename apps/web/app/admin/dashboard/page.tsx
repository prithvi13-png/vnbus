import type { Metadata } from "next";

import { AdminDashboardWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminDashboardWorkspace />
    </DashboardShell>
  );
}
