import type { Metadata } from "next";

import { DashboardShell } from "../../../components/dashboard-shell";
import { CustomerSupportCenter } from "../../../components/marketplace-readiness";

export const metadata: Metadata = {
  title: "Customer Support",
};

export default function CustomerSupportPage(): React.JSX.Element {
  return (
    <DashboardShell area="customer">
      <CustomerSupportCenter />
    </DashboardShell>
  );
}
