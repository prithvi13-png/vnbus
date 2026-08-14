import type { Metadata } from "next";

import { AgentQuickBookingWorkspace } from "../../../components/agent-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Agent Quick Booking",
};

export default function AgentQuickBookingPage(): React.JSX.Element {
  return (
    <DashboardShell area="agent">
      <AgentQuickBookingWorkspace />
    </DashboardShell>
  );
}
