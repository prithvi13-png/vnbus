import type { Metadata } from "next";

import { AdminSystemMonitoringWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";
import { AdminHealthDashboard } from "../../../components/milestone-nine-widgets";

export const metadata: Metadata = {
  title: "Admin System Monitoring",
};

export default function AdminSystemMonitoringPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminSystemMonitoringWorkspace />
      <div className="mt-6">
        <AdminHealthDashboard />
      </div>
    </DashboardShell>
  );
}
