import type { Metadata } from "next";

import { AgentProfileWorkspace } from "../../../components/agent-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Agent Profile",
};

export default function AgentProfilePage(): React.JSX.Element {
  return (
    <DashboardShell area="agent">
      <AgentProfileWorkspace />
    </DashboardShell>
  );
}
