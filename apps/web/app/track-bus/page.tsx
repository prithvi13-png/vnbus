import type { Metadata } from "next";

import { PublicTrackingCenter } from "../../components/marketplace-readiness";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "Track Bus",
  description: "Mock scheduled-route tracking for Vriddhi Nexus bus bookings.",
};

export default function TrackBusPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader />
      <main className="bg-brand-50/40 dark:bg-brand-950">
        <PublicTrackingCenter />
      </main>
      <SiteFooter />
    </>
  );
}
