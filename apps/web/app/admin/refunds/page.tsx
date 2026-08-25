import type { Metadata } from "next";

import { DashboardShell } from "../../../components/dashboard-shell";
import { AdminRefundOperations } from "../../../components/marketplace-readiness";

export const metadata: Metadata = {
  title: "Refund Operations",
};

export default function AdminRefundsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminRefundOperations />
    </DashboardShell>
  );
}
