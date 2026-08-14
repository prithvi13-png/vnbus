import type { Metadata } from "next";

import { AdminUsersWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Users",
};

export default function AdminUsersPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminUsersWorkspace />
    </DashboardShell>
  );
}
