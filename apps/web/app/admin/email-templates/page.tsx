import type { Metadata } from "next";

import { AdminEmailTemplatesWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Email Templates",
};

export default function AdminEmailTemplatesPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminEmailTemplatesWorkspace />
    </DashboardShell>
  );
}
