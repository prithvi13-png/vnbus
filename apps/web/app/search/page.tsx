import type { Metadata } from "next";
import { PublicLayout } from "@vnbus/ui";
import { buildSearchParams, buildSearchRequestFromParams } from "@vnbus/shared";

import { MilestoneNineSearchWorkspace } from "../../components/milestone-nine-widgets";
import { SearchExperience } from "../../components/search-experience";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

type PageSearchParams = Record<string, string | string[] | undefined>;

interface SearchPageProps {
  searchParams?: Promise<PageSearchParams>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await resolveSearchParams(searchParams);
  const request = buildSearchRequestFromObject(params);
  const hasRoute = Boolean(firstParam(params.from) ?? firstParam(params.sourceCity));
  const title = hasRoute
    ? `${request.sourceCity} to ${request.destinationCity} Bus Search`
    : "Bus Search";
  const description = hasRoute
    ? `Compare buses from ${request.sourceCity} to ${request.destinationCity} on ${request.journeyDate}.`
    : "Search intercity buses across popular Indian routes for Vriddhi Nexus Pvt Ltd.";
  const canonical = `/search?${buildSearchParams(request).toString()}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps): Promise<React.JSX.Element> {
  const params = await resolveSearchParams(searchParams);
  const request = buildSearchRequestFromObject(params);
  const hasRoute = Boolean(firstParam(params.from) ?? firstParam(params.sourceCity));
  const schema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: `${request.sourceCity} to ${request.destinationCity} bus search`,
    url: `/search?${buildSearchParams(request).toString()}`,
    potentialAction: {
      "@type": "SearchAction",
      target: "/search?from={from}&to={to}&date={date}",
      "query-input": ["required name=from", "required name=to", "required name=date"],
    },
  };

  return (
    <PublicLayout>
      <SiteHeader />
      <main className="bg-gray-50 dark:bg-gray-950">
        <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-normal text-blue-700 dark:text-blue-300">
              Bus Search
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-gray-950 dark:text-gray-50">
              {hasRoute
                ? `${request.sourceCity} to ${request.destinationCity}`
                : "Search buses across Indian routes"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Intercity bus options across popular Indian corridors.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <SearchExperience />
        </section>
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <MilestoneNineSearchWorkspace />
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </main>
      <SiteFooter />
    </PublicLayout>
  );
}

async function resolveSearchParams(
  searchParams: SearchPageProps["searchParams"],
): Promise<PageSearchParams> {
  return searchParams ? searchParams : {};
}

function buildSearchRequestFromObject(params: PageSearchParams) {
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const scalar = Array.isArray(value) ? value[0] : value;
    if (scalar) {
      urlParams.set(key, scalar);
    }
  }

  return buildSearchRequestFromParams(urlParams);
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
