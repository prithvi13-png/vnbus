import type { Metadata } from "next";

import { AdminOffersWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Offers",
};

export default function AdminOffersPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminOffersWorkspace />
    </DashboardShell>
  );
}
