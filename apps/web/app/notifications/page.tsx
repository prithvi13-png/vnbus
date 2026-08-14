import type { Metadata } from "next";

import { NotificationCenter } from "../../components/booking-management";
import { DashboardShell } from "../../components/dashboard-shell";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage(): React.JSX.Element {
  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Notifications"
        title="Notification Center"
        description="Unread and read booking updates, cancellation updates, reschedule updates, and email history."
        actionHref="/booking-history"
        actionLabel="Bookings"
      />
      <NotificationCenter />
    </DashboardShell>
  );
}
