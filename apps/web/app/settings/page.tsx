import type { Metadata } from "next";

import { DashboardShell } from "../../components/dashboard-shell";
import { ModulePage } from "../../components/module-page";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage(): React.JSX.Element {
  return (
    <DashboardShell>
      <ModulePage
        eyebrow="Settings"
        title="Settings"
        description="User preferences, notification rules, and security controls."
        rows={[
          ["Notifications", "Email and in-app", "Delivery preference"],
          ["Security", "Refresh token rotation", "Session policy"],
          ["Currency", "INR", "Booking display"],
        ]}
      />
    </DashboardShell>
  );
}
