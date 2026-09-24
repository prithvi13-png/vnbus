import { Card, CardContent, PublicLayout } from "@vnbus/ui";

import type { LegalBlock, LegalDocument } from "../lib/legal-content";
import { company } from "../lib/legal-content";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

function Blocks({ block }: { block: LegalBlock }): React.JSX.Element {
  return (
    <>
      {block.body?.map((paragraph) => (
        <p key={paragraph} className="text-sm leading-6 text-gray-600 dark:text-gray-400">
          {paragraph}
        </p>
      ))}

      {block.bullets && (
        <ul className="grid list-disc gap-1.5 pl-5 text-sm leading-6 text-gray-600 marker:text-gold-500 dark:text-gray-400">
          {block.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * Renders a legal document from lib/legal-content. The wording lives there and
 * is reproduced verbatim; this file only decides how it looks.
 */
export function LegalDocumentPage({ document }: { document: LegalDocument }): React.JSX.Element {
  return (
    <PublicLayout>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="grid gap-8 py-8">
            <header className="grid gap-2">
              <h1 className="text-3xl font-semibold text-brand-950 dark:text-white">
                {document.title}
              </h1>
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">{document.intro}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Effective date: {document.effectiveDate} &middot; Last updated:{" "}
                {document.lastUpdated}
              </p>
            </header>

            <div className="grid gap-7">
              {document.sections.map((section) => (
                <section key={section.heading} className="grid gap-2.5">
                  <h2 className="text-lg font-semibold text-brand-950 dark:text-white">
                    {section.heading}
                  </h2>
                  <Blocks block={section} />

                  {section.subsections?.map((subsection, index) => (
                    <div
                      key={subsection.heading ?? `continuation-${index}`}
                      className="mt-1 grid gap-2"
                    >
                      {subsection.heading && (
                        <h3 className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                          {subsection.heading}
                        </h3>
                      )}
                      <Blocks block={subsection} />
                    </div>
                  ))}
                </section>
              ))}
            </div>

            <footer className="grid gap-1 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="font-semibold text-brand-950 dark:text-white">Contact</p>
              <p className="text-gray-600 dark:text-gray-400">
                Support:{" "}
                <a
                  href={`mailto:${company.supportEmail}`}
                  className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                >
                  {company.supportEmail}
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Grievance Officer: {company.grievanceOfficer.name} —{" "}
                <a
                  href={`mailto:${company.grievanceOfficer.email}`}
                  className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                >
                  {company.grievanceOfficer.email}
                </a>
                ,{" "}
                <a
                  href={`tel:${company.grievanceOfficer.phone.replace(/\s+/g, "")}`}
                  className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                >
                  {company.grievanceOfficer.phone}
                </a>
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {company.legalName} &middot; CIN: {company.cin} &middot; GSTIN: {company.gstin}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{company.address}</p>
            </footer>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </PublicLayout>
  );
}
