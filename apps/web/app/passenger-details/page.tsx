import type { Metadata } from "next";
import { PublicLayout } from "@vnbus/ui";

import { PassengerDetailsFlow } from "../../components/booking-flow";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "Passenger Details",
};

export default function PassengerDetailsPage(): React.JSX.Element {
  return (
    <PublicLayout>
      <SiteHeader />
      <main className="bg-brand-50/50 dark:bg-gray-950">
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <PassengerDetailsFlow />
        </section>
      </main>
      <SiteFooter />
    </PublicLayout>
  );
}
