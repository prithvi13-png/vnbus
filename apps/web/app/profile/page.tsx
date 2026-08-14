import type { Metadata } from "next";

import { DashboardShell } from "../../components/dashboard-shell";
import { PageHeader } from "../../components/page-header";
import { ProfileSettings } from "../../components/profile-settings";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage(): React.JSX.Element {
  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Profile"
        title="Profile"
        description="Account identity, contact details, and role-backed access."
      />
      <ProfileSettings />
    </DashboardShell>
  );
}
