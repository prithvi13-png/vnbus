import type { Metadata } from "next";

import { CustomerSupportCenter } from "../../components/marketplace-readiness";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "Support",
  description: "Helpdesk and customer support surface for Vriddhi Nexus bookings.",
};

export default function SupportPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CustomerSupportCenter />
      </main>
      <SiteFooter />
    </>
  );
}
