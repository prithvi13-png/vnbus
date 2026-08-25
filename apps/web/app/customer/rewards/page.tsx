import type { Metadata } from "next";

import { DashboardShell } from "../../../components/dashboard-shell";
import { CustomerRewardsCenter } from "../../../components/marketplace-readiness";

export const metadata: Metadata = {
  title: "Wallet and Rewards",
};

export default function CustomerRewardsPage(): React.JSX.Element {
  return (
    <DashboardShell area="customer">
      <CustomerRewardsCenter />
    </DashboardShell>
  );
}
