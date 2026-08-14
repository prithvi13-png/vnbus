import type { Metadata } from "next";

import { AdminCmsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin CMS",
};

export default function AdminCmsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminCmsWorkspace />
    </DashboardShell>
  );
}
