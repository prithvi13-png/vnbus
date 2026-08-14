import type { Metadata } from "next";

import { AdminPlatformSettingsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Platform Settings",
};

export default function AdminPlatformSettingsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminPlatformSettingsWorkspace />
    </DashboardShell>
  );
}
