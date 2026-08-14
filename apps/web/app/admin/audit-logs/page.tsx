import type { Metadata } from "next";

import { AdminAuditLogsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Audit Logs",
};

export default function AdminAuditLogsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminAuditLogsWorkspace />
    </DashboardShell>
  );
}
