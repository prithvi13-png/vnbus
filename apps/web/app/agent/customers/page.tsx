import type { Metadata } from "next";

import { AgentCustomersWorkspace } from "../../../components/agent-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Agent Customers",
};

export default function AgentCustomersPage(): React.JSX.Element {
  return (
    <DashboardShell area="agent">
      <AgentCustomersWorkspace />
    </DashboardShell>
  );
}
