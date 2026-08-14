import type { Metadata } from "next";

import { DashboardShell } from "../../../components/dashboard-shell";
import { PageHeader } from "../../../components/page-header";
import { ProfileSettings } from "../../../components/profile-settings";

export const metadata: Metadata = {
  title: "Customer Profile",
};

export default function CustomerProfilePage(): React.JSX.Element {
  return (
    <DashboardShell area="customer">
      <PageHeader
        eyebrow="Customer"
        title="Profile"
        description="Traveller identity and verified contact information."
      />
      <ProfileSettings />
    </DashboardShell>
  );
}
