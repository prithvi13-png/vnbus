import type { Metadata } from "next";

import { DashboardShell } from "../../../components/dashboard-shell";
import { CustomerTrackingCenter } from "../../../components/marketplace-readiness";

export const metadata: Metadata = {
  title: "Trip Tracking",
};

export default function CustomerTrackingPage(): React.JSX.Element {
  return (
    <DashboardShell area="customer">
      <CustomerTrackingCenter />
    </DashboardShell>
  );
}
