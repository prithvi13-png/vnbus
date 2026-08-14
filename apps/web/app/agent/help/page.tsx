import type { Metadata } from "next";

import { AgentHelpWorkspace } from "../../../components/agent-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Agent Help",
};

export default function AgentHelpPage(): React.JSX.Element {
  return (
    <DashboardShell area="agent">
      <AgentHelpWorkspace />
    </DashboardShell>
  );
}
