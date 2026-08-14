import type { Metadata } from "next";
import { PublicLayout } from "@vnbus/ui";

import { TicketViewFlow } from "../../components/booking-flow";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "Ticket",
};

export default function TicketPage(): React.JSX.Element {
  return (
    <PublicLayout>
      <SiteHeader />
      <main className="bg-gray-50 dark:bg-gray-950">
        <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <TicketViewFlow />
        </section>
      </main>
      <SiteFooter />
    </PublicLayout>
  );
}
