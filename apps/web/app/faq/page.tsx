import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  PublicLayout,
} from "@vnbus/ui";

import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { faqGroups, faqHelp } from "../../lib/faq-content";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common questions about booking a bus with Vriddhi Nexus, payments, refunds, cancellations and payment safety.",
};

export default function FaqPage(): React.JSX.Element {
  return (
    <PublicLayout>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="grid gap-8 py-8">
            <header className="grid gap-2">
              <h1 className="text-3xl font-semibold text-brand-950 dark:text-white">
                Frequently Asked Questions
              </h1>
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                Booking, payments, refunds and cancellations — answered.
              </p>
            </header>

            {faqGroups.map((group) => (
              <section key={group.title} className="grid gap-3">
                <h2 className="text-lg font-semibold text-brand-950 dark:text-white">
                  {group.title}
                </h2>
                <Accordion type="single" collapsible className="grid gap-3">
                  {group.entries.map((entry) => (
                    <AccordionItem
                      key={entry.question}
                      value={entry.question}
                      className="rounded-lg border border-gray-200 px-4 dark:border-gray-800"
                    >
                      <AccordionTrigger>{entry.question}</AccordionTrigger>
                      <AccordionContent>{entry.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}

            <footer className="grid gap-1 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="font-semibold text-brand-950 dark:text-white">{faqHelp.title}</p>
              <p className="text-gray-600 dark:text-gray-400">{faqHelp.body}</p>
              <p className="mt-1 font-medium text-brand-950 dark:text-white">{faqHelp.legalName}</p>
              <p className="text-gray-600 dark:text-gray-400">Website: {faqHelp.website}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Email:{" "}
                <a
                  href={`mailto:${faqHelp.supportEmail}`}
                  className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                >
                  {faqHelp.supportEmail}
                </a>
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{faqHelp.note}</p>
            </footer>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </PublicLayout>
  );
}
