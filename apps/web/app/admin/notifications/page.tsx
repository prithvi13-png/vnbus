import type { Metadata } from "next";

import { AdminNotificationsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Notifications",
};

export default function AdminNotificationsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminNotificationsWorkspace />
    </DashboardShell>
  );
}
