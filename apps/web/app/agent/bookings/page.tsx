import type { Metadata } from "next";

import { AgentBookingsWorkspace } from "../../../components/agent-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Agent Bookings",
};

export default function AgentBookingsPage(): React.JSX.Element {
  return (
    <DashboardShell area="agent">
      <AgentBookingsWorkspace />
    </DashboardShell>
  );
}
