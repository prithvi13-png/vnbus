import type { Metadata } from "next";

import { AdminProfileWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Profile",
};

export default function AdminProfilePage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminProfileWorkspace />
    </DashboardShell>
  );
}
