import type { Metadata } from "next";

import { AgentDashboardWorkspace } from "../../../components/agent-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Agent Dashboard",
};

export default function AgentDashboardPage(): React.JSX.Element {
  return (
    <DashboardShell area="agent">
      <AgentDashboardWorkspace />
    </DashboardShell>
  );
}
