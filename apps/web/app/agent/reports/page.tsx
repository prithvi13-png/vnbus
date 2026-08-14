import type { Metadata } from "next";

import { AgentReportsWorkspace } from "../../../components/agent-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Agent Reports",
};

export default function AgentReportsPage(): React.JSX.Element {
  return (
    <DashboardShell area="agent">
      <AgentReportsWorkspace />
    </DashboardShell>
  );
}
