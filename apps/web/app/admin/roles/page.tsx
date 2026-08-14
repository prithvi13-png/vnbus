import type { Metadata } from "next";

import { AdminRolesWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Roles",
};

export default function AdminRolesPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminRolesWorkspace />
    </DashboardShell>
  );
}
