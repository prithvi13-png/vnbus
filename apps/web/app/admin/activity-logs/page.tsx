import type { Metadata } from "next";

import { AdminActivityLogsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Activity Logs",
};

export default function AdminActivityLogsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminActivityLogsWorkspace />
    </DashboardShell>
  );
}
