import type { Metadata } from "next";

import { AdminCustomersWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Customers",
};

export default function AdminCustomersPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminCustomersWorkspace />
    </DashboardShell>
  );
}
