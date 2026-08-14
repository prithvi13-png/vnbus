import type { Metadata } from "next";

import { AdminFeatureFlagsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Feature Flags",
};

export default function AdminFeatureFlagsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminFeatureFlagsWorkspace />
    </DashboardShell>
  );
}
