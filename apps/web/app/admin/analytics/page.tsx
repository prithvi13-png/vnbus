import type { Metadata } from "next";

import { AdminAnalyticsWorkspace } from "../../../components/admin-portal";
import { DashboardShell } from "../../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "Admin Analytics",
};

export default function AdminAnalyticsPage(): React.JSX.Element {
  return (
    <DashboardShell area="admin">
      <AdminAnalyticsWorkspace />
    </DashboardShell>
  );
}
