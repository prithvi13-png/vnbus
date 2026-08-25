import type { Metadata } from "next";

import { DashboardShell } from "../../../components/dashboard-shell";
import { CustomerTravellersCenter } from "../../../components/marketplace-readiness";

export const metadata: Metadata = {
  title: "Saved Travellers",
};

export default function CustomerTravellersPage(): React.JSX.Element {
  return (
    <DashboardShell area="customer">
      <CustomerTravellersCenter />
    </DashboardShell>
  );
}
