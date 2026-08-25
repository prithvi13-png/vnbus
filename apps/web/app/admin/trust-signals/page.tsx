import type { Metadata } from "next";

import { DashboardShell } from "../../../components/dashboard-shell";
import { AdminTrustOperations } from "../../../components/marketplace-readiness";

export const metadata: Metadata = {
  title: "Trust Signals",
};

export default function AdminTrustSignalsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminTrustOperations />
    </DashboardShell>
  );
}
