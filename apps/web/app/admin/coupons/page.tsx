import type { Metadata } from "next";

import { AdminCouponsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Coupons",
};

export default function AdminCouponsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminCouponsWorkspace />
    </DashboardShell>
  );
}
