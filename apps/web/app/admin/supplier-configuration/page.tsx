import type { Metadata } from "next";

import { AdminSupplierConfigurationWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Supplier Configuration",
};

export default function AdminSupplierConfigurationPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminSupplierConfigurationWorkspace />
    </DashboardShell>
  );
}
