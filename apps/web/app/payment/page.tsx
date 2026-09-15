import type { Metadata } from "next";
import { PublicLayout } from "@vnbus/ui";

import { PaymentFlow } from "../../components/payment-flow";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = {
  title: "Payment",
};

export default function PaymentPage(): React.JSX.Element {
  return (
    <PublicLayout>
      <SiteHeader />
      <main className="bg-brand-50/50 dark:bg-gray-950">
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <PaymentFlow />
        </section>
      </main>
      <SiteFooter />
    </PublicLayout>
  );
}
