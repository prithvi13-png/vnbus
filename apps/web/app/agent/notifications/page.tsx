import type { Metadata } from "next";

import { AgentNotificationsWorkspace } from "../../../components/agent-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Agent Notifications",
};

export default function AgentNotificationsPage(): React.JSX.Element {
  return (
    <DashboardShell area="agent">
      <AgentNotificationsWorkspace />
    </DashboardShell>
  );
}
