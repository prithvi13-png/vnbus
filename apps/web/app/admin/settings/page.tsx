import type { Metadata } from "next";

import { AdminPlatformSettingsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Settings",
};

export default function AdminSettingsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminPlatformSettingsWorkspace />
    </DashboardShell>
  );
}
