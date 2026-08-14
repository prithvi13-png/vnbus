import type { Metadata } from "next";

import { AgentSettingsWorkspace } from "../../../components/agent-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Agent Settings",
};

export default function AgentSettingsPage(): React.JSX.Element {
  return (
    <DashboardShell area="agent">
      <AgentSettingsWorkspace />
    </DashboardShell>
  );
}
