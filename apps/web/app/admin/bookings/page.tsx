import type { Metadata } from "next";

import { AdminBookingsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Bookings",
};

export default function AdminBookingsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminBookingsWorkspace />
    </DashboardShell>
  );
}
