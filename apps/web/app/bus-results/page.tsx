import { redirect } from "next/navigation";
import { buildSearchParams, buildSearchRequestFromParams } from "@vnbus/shared";

type PageSearchParams = Record<string, string | string[] | undefined>;

interface BusResultsPageProps {
  searchParams?: Promise<PageSearchParams>;
}

export default async function BusResultsPage({
  searchParams,
}: BusResultsPageProps): Promise<never> {
  const params = await resolveSearchParams(searchParams);
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const scalar = Array.isArray(value) ? value[0] : value;
    if (scalar) {
      urlParams.set(key, scalar);
    }
  }

  const request = buildSearchRequestFromParams(urlParams);

  redirect(`/search?${buildSearchParams(request).toString()}`);
}

async function resolveSearchParams(
  searchParams: BusResultsPageProps["searchParams"],
): Promise<PageSearchParams> {
  return searchParams ? searchParams : {};
}
