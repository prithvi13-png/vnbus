"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Armchair,
  BadgeIndianRupee,
  Filter,
  Heart,
  IndianRupee,
  MapPin,
  RefreshCw,
  Route,
  ShieldCheck,
  Star,
  Wifi,
} from "lucide-react";
import type {
  BusAmenity,
  BusSearchRequest,
  BusSearchResponse,
  BusSearchResult,
  BusType,
  SearchFilterOption,
  SearchSortOption,
  SearchTimeWindow,
} from "@vnbus/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  EmptyState,
  Input,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatusChip,
  Tag,
  cn,
} from "@vnbus/ui";
import { buildSearchParams, buildSearchRequestFromParams, SEARCH_SORT_LABELS } from "@vnbus/shared";

import { searchBuses } from "../lib/api-client";
import type { SearchFormValues } from "../lib/search-schema";
import { useSearchStore } from "../lib/search-store";
import { SearchPanel } from "./search-panel";

const LazyRouteMapPreview = dynamic(
  () => import("./route-map-preview").then((module) => module.RouteMapPreview),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full" />,
  },
);

type SearchPatch = {
  [Key in keyof BusSearchRequest]?: BusSearchRequest[Key] | undefined;
};

export function SearchExperience(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryString = searchParams?.toString() ?? "";
  const request = React.useMemo(
    () => buildSearchRequestFromParams(new URLSearchParams(queryString)),
    [queryString],
  );
  const hasSearch =
    searchParams?.has("from") === true && searchParams.has("to") && searchParams.has("date");
  const favoriteRoutes = useSearchStore((state) => state.favoriteRoutes);
  const toggleFavoriteRoute = useSearchStore((state) => state.toggleFavoriteRoute);
  const initialValues: SearchFormValues = {
    sourceCity: request.sourceCity,
    destinationCity: request.destinationCity,
    journeyDate: request.journeyDate,
    passengerCount: request.passengerCount,
  };
  const query = useQuery({
    queryKey: ["bus-search", queryString],
    queryFn: () => searchBuses(request),
    enabled: hasSearch,
    staleTime: 60_000,
  });

  const updateSearch = React.useCallback(
    (patch: SearchPatch) => {
      const next = mergeSearchRequest(request, patch);
      const params = buildSearchParams(next);
      router.push(`/search?${params.toString()}`);
    },
    [request, router],
  );

  if (!hasSearch) {
    return (
      <div className="grid gap-6">
        <SearchPanel initialValues={initialValues} />
        <Card>
          <CardHeader>
            <CardTitle>Favorite Routes</CardTitle>
            <CardDescription>
              Start quickly from saved routes and realistic mock inventory.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {favoriteRoutes.map((route) => (
              <Button
                key={`${route.sourceCity}-${route.destinationCity}`}
                type="button"
                variant="outline"
                className="h-auto justify-start p-3"
                onClick={() =>
                  updateSearch({
                    sourceCity: route.sourceCity,
                    destinationCity: route.destinationCity,
                    journeyDate: request.journeyDate,
                    passengerCount: 1,
                  })
                }
              >
                <Route className="h-4 w-4" aria-hidden="true" />
                {route.sourceCity} to {route.destinationCity}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="sticky top-16 z-20 rounded-lg border border-gold-100 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-brand-900 dark:bg-brand-950/95">
        <SearchPanel compact initialValues={initialValues} />
      </section>

      {query.isLoading ? <SearchSkeleton /> : null}

      {query.isError ? (
        <Card>
          <CardContent className="p-6">
            <Alert variant="danger">
              <AlertTitle>Search failed</AlertTitle>
              <AlertDescription>
                The mock search service could not return results. Try again.
              </AlertDescription>
            </Alert>
            <Button type="button" className="mt-4" onClick={() => void query.refetch()}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {query.data ? (
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <SearchFilters request={request} response={query.data} onChange={updateSearch} />
          <section className="grid gap-5">
            <ResultsToolbar
              request={request}
              totalResults={query.data.totalResults}
              onChange={updateSearch}
            />
            {query.data.buses[0]?.routePreview ? (
              <LazyRouteMapPreview preview={query.data.buses[0].routePreview} />
            ) : null}
            {query.data.buses.length ? (
              <>
                <div className="grid gap-4">
                  {query.data.buses.map((bus) => (
                    <BusResultCard
                      key={bus.tripId}
                      bus={bus}
                      favorite={favoriteRoutes.some(
                        (route) =>
                          route.sourceCity === bus.sourceCity &&
                          route.destinationCity === bus.destinationCity,
                      )}
                      onFavorite={() =>
                        toggleFavoriteRoute({
                          sourceCity: bus.sourceCity,
                          destinationCity: bus.destinationCity,
                        })
                      }
                      journeyDate={request.journeyDate}
                    />
                  ))}
                </div>
                <Pagination
                  page={query.data.pagination.page}
                  pageCount={query.data.pagination.totalPages}
                  onPageChange={(page) => updateSearch({ page })}
                />
              </>
            ) : (
              <EmptyState
                title="No buses found"
                description="Adjust filters, choose another date, or try a popular route."
                actionLabel="Clear filters"
                onAction={() =>
                  updateSearch({
                    amenities: [],
                    arrivalWindows: [],
                    busTypes: [],
                    departureWindows: [],
                    maxPrice: undefined,
                    minAvailableSeats: undefined,
                    minPrice: undefined,
                    minRating: undefined,
                    operators: [],
                    liveTracking: undefined,
                  })
                }
              />
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function mergeSearchRequest(request: BusSearchRequest, patch: SearchPatch): BusSearchRequest {
  const next = { ...request } as Record<string, unknown>;

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
  }

  next.page = patch.page ?? (patch.pageSize ? 1 : 1);

  return next as unknown as BusSearchRequest;
}

function ResultsToolbar({
  onChange,
  request,
  totalResults,
}: {
  onChange: (patch: SearchPatch) => void;
  request: BusSearchRequest;
  totalResults: number;
}): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-950 dark:text-gray-50">
            {totalResults.toLocaleString("en-IN")} buses found
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {request.sourceCity} to {request.destinationCity} · {request.journeyDate}
          </p>
        </div>
        <div className="flex min-w-64 items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort</span>
          <Select
            value={request.sortBy ?? "POPULARITY_DESC"}
            onValueChange={(value) => onChange({ sortBy: value as SearchSortOption })}
          >
            <SelectTrigger aria-label="Sort results">
              <SelectValue placeholder="Sort results" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(SEARCH_SORT_LABELS) as Array<[SearchSortOption, string]>).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function SearchFilters({
  onChange,
  request,
  response,
}: {
  onChange: (patch: SearchPatch) => void;
  request: BusSearchRequest;
  response: BusSearchResponse;
}): React.JSX.Element {
  const filters = response.filters;

  return (
    <aside className="h-max rounded-lg border border-gold-100 bg-white p-4 dark:border-brand-900 dark:bg-brand-950 xl:sticky xl:top-40">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gold-600 dark:text-gold-100" aria-hidden="true" />
          <h2 className="text-base font-semibold text-brand-900 dark:text-white">Filters</h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange({
              amenities: [],
              arrivalWindows: [],
              busTypes: [],
              departureWindows: [],
              maxPrice: undefined,
              minAvailableSeats: undefined,
              minPrice: undefined,
              minRating: undefined,
              operators: [],
              liveTracking: undefined,
            })
          }
        >
          Reset
        </Button>
      </div>
      <div className="mt-4 grid gap-5">
        <FilterGroup title="Price">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={filters.price.min}
              max={filters.price.max}
              value={request.minPrice ?? ""}
              placeholder={`Min ${filters.price.min}`}
              aria-label="Minimum price"
              onChange={(event) =>
                onChange({ minPrice: event.target.value ? Number(event.target.value) : undefined })
              }
            />
            <Input
              type="number"
              min={filters.price.min}
              max={filters.price.max}
              value={request.maxPrice ?? ""}
              placeholder={`Max ${filters.price.max}`}
              aria-label="Maximum price"
              onChange={(event) =>
                onChange({ maxPrice: event.target.value ? Number(event.target.value) : undefined })
              }
            />
          </div>
        </FilterGroup>

        <FilterGroup title="Departure Time">
          <CheckboxList
            options={filters.departureWindows}
            selected={request.departureWindows ?? []}
            onToggle={(value) =>
              onChange({
                departureWindows: toggleValue(
                  request.departureWindows ?? [],
                  value as SearchTimeWindow,
                ),
              })
            }
          />
        </FilterGroup>

        <FilterGroup title="Arrival Time">
          <CheckboxList
            options={filters.arrivalWindows}
            selected={request.arrivalWindows ?? []}
            onToggle={(value) =>
              onChange({
                arrivalWindows: toggleValue(
                  request.arrivalWindows ?? [],
                  value as SearchTimeWindow,
                ),
              })
            }
          />
        </FilterGroup>

        <FilterGroup title="Bus Type">
          <CheckboxList
            options={filters.busTypes}
            selected={request.busTypes ?? []}
            onToggle={(value) =>
              onChange({ busTypes: toggleValue(request.busTypes ?? [], value as BusType) })
            }
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <TogglePill
              active={request.ac === true}
              label="AC"
              onClick={() => onChange({ ac: request.ac ? undefined : true })}
            />
            <TogglePill
              active={request.nonAc === true}
              label="Non AC"
              onClick={() => onChange({ nonAc: request.nonAc ? undefined : true })}
            />
            <TogglePill
              active={request.sleeper === true}
              label="Sleeper"
              onClick={() => onChange({ sleeper: request.sleeper ? undefined : true })}
            />
            <TogglePill
              active={request.seater === true}
              label="Seater"
              onClick={() => onChange({ seater: request.seater ? undefined : true })}
            />
          </div>
        </FilterGroup>

        <FilterGroup title="Operators">
          <VirtualizedCheckboxList
            options={filters.operators}
            selected={request.operators ?? []}
            onToggle={(value) =>
              onChange({ operators: toggleValue(request.operators ?? [], value) })
            }
          />
        </FilterGroup>

        <FilterGroup title="Amenities">
          <CheckboxList
            options={filters.amenities}
            selected={request.amenities ?? []}
            onToggle={(value) =>
              onChange({ amenities: toggleValue(request.amenities ?? [], value as BusAmenity) })
            }
          />
        </FilterGroup>

        <FilterGroup title="Seats, Rating, Tracking">
          <div className="grid gap-2">
            <Input
              type="number"
              min={1}
              max={filters.availableSeats.max}
              value={request.minAvailableSeats ?? ""}
              placeholder="Minimum available seats"
              aria-label="Minimum available seats"
              onChange={(event) =>
                onChange({
                  minAvailableSeats: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
            <Select
              value={request.minRating ? String(request.minRating) : "any"}
              onValueChange={(value) =>
                onChange({ minRating: value === "any" ? undefined : Number(value) })
              }
            >
              <SelectTrigger aria-label="Minimum rating">
                <SelectValue placeholder="Minimum rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any rating</SelectItem>
                {filters.ratings.map((rating) => (
                  <SelectItem key={rating.value} value={rating.value}>
                    {rating.label} ({rating.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 rounded-md border border-gold-100 p-2 text-sm dark:border-brand-900">
              <Checkbox
                checked={request.liveTracking === true}
                onCheckedChange={(checked) =>
                  onChange({ liveTracking: checked === true ? true : undefined })
                }
              />
              Live Tracking
            </label>
          </div>
        </FilterGroup>
      </div>
    </aside>
  );
}

function BusResultCard({
  bus,
  favorite,
  journeyDate,
  onFavorite,
}: {
  bus: BusSearchResult;
  favorite: boolean;
  journeyDate: string;
  onFavorite: () => void;
}): React.JSX.Element {
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-0 p-0 lg:grid-cols-[180px_1fr]">
        <div className="hidden bg-brand-50 p-3 dark:bg-brand-950 lg:block">
          <div className="relative h-full min-h-56 overflow-hidden rounded-md bg-white/80 dark:bg-brand-950/50">
            <Image
              src={bus.busImageUrl}
              alt={`${bus.busType} bus`}
              fill
              loading="lazy"
              unoptimized
              sizes="156px"
              className="object-contain"
            />
          </div>
        </div>
        <div className="grid gap-5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-3">
              <Image
                src={bus.operatorLogoUrl}
                alt=""
                width={48}
                height={48}
                loading="lazy"
                unoptimized
                className="h-12 w-12 rounded-md border border-gold-100 bg-white object-cover dark:border-brand-900"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-brand-900 dark:text-white">
                    {bus.operatorName}
                  </h2>
                  <Badge variant="neutral">{bus.busType}</Badge>
                  {bus.liveTracking ? <StatusChip tone="success">Live Tracking</StatusChip> : null}
                  {bus.discountLabel ? <Badge variant="warning">{bus.discountLabel}</Badge> : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Rating rating={bus.rating} reviews={bus.reviewCount} />
                  <Tag>{bus.seatLayout.layoutType}</Tag>
                  <Tag>{bus.seatLayout.decks} deck</Tag>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={favorite ? "Remove favorite route" : "Save favorite route"}
              onClick={onFavorite}
            >
              <Heart
                className={cn("h-4 w-4", favorite && "fill-red-500 text-red-500")}
                aria-hidden="true"
              />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
            <TripTime label="Depart" city={bus.sourceCity} time={formatTime(bus.departureTime)} />
            <div className="hidden min-w-28 text-center md:block">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {formatDuration(bus.durationMinutes)}
              </p>
              <div className="mt-2 h-px bg-gray-200 dark:bg-gray-800" />
            </div>
            <TripTime
              label="Arrive"
              city={bus.destinationCity}
              time={formatTime(bus.arrivalTime)}
            />
            <div className="flex items-center justify-between gap-4 md:block md:text-right">
              <div>
                <p className="text-xs uppercase tracking-normal text-gray-500 dark:text-gray-400">
                  Starting fare
                </p>
                <p className="flex items-center text-2xl font-semibold text-gray-950 dark:text-gray-50 md:justify-end">
                  <IndianRupee className="h-5 w-5" aria-hidden="true" />
                  {bus.fare.amount.toLocaleString("en-IN")}
                </p>
              </div>
              <Button asChild>
                <Link href={`/seat-layout?tripId=${bus.tripId}&date=${journeyDate}`}>
                  <Armchair className="h-4 w-4" aria-hidden="true" />
                  View Seats
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <BusDetailsCard bus={bus} />
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                {bus.amenities.slice(0, 8).map((amenity) => (
                  <Tag key={amenity}>
                    <Wifi className="h-3 w-3" aria-hidden="true" />
                    {amenity}
                  </Tag>
                ))}
              </div>
              <div className="grid gap-2 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-3">
                <Fact icon={Armchair} label="Available seats" value={`${bus.availableSeats}`} />
                <Fact
                  icon={BadgeIndianRupee}
                  label="Discount"
                  value={bus.discountLabel ?? "Best fare"}
                />
                <Fact icon={ShieldCheck} label="Supplier" value={bus.supplierCode} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BusDetailsCard({ bus }: { bus: BusSearchResult }): React.JSX.Element {
  return (
    <div className="rounded-md border border-gold-100 p-3 dark:border-brand-900">
      <h3 className="text-sm font-semibold text-brand-900 dark:text-white">Bus Details</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <PointList title="Boarding" points={bus.boardingPoints.slice(0, 3)} />
        <PointList title="Dropping" points={bus.droppingPoints.slice(0, 3)} />
      </div>
    </div>
  );
}

function PointList({
  points,
  title,
}: {
  points: BusSearchResult["boardingPoints"];
  title: string;
}): React.JSX.Element {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-normal text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <ul className="mt-2 grid gap-1.5">
        {points.map((point) => (
          <li
            key={point.id}
            className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
          >
            <MapPin
              className="mt-0.5 h-3.5 w-3.5 text-gold-600 dark:text-gold-100"
              aria-hidden="true"
            />
            <span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{point.time}</span>{" "}
              {point.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SearchSkeleton(): React.JSX.Element {
  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <Skeleton className="h-[620px] w-full" />
      <div className="grid gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

function FilterGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}): React.JSX.Element {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-brand-900 dark:text-white">{title}</h3>
      {children}
    </section>
  );
}

function CheckboxList({
  onToggle,
  options,
  selected,
}: {
  onToggle: (value: string) => void;
  options: SearchFilterOption[];
  selected: string[];
}): React.JSX.Element {
  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <FilterCheckbox
          key={option.value}
          onToggle={onToggle}
          option={option}
          selected={selected}
        />
      ))}
    </div>
  );
}

function VirtualizedCheckboxList({
  onToggle,
  options,
  selected,
}: {
  onToggle: (value: string) => void;
  options: SearchFilterOption[];
  selected: string[];
}): React.JSX.Element {
  const itemHeight = 34;
  const viewportHeight = 238;
  const [scrollTop, setScrollTop] = React.useState(0);
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const visibleCount = Math.ceil(viewportHeight / itemHeight) + 4;
  const visible = options.slice(start, start + visibleCount);

  return (
    <div
      className="relative overflow-y-auto rounded-md border border-gold-100 dark:border-brand-900"
      style={{ height: viewportHeight }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: options.length * itemHeight, position: "relative" }}>
        <div
          style={{ transform: `translateY(${start * itemHeight}px)` }}
          className="absolute inset-x-0 top-0 grid gap-1 p-2"
        >
          {visible.map((option) => (
            <FilterCheckbox
              key={option.value}
              onToggle={onToggle}
              option={option}
              selected={selected}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterCheckbox({
  onToggle,
  option,
  selected,
}: {
  onToggle: (value: string) => void;
  option: SearchFilterOption;
  selected: string[];
}): React.JSX.Element {
  return (
    <label className="flex min-h-8 items-center justify-between gap-3 rounded-sm px-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900">
      <span className="flex items-center gap-2">
        <Checkbox
          checked={selected.includes(option.value)}
          onCheckedChange={() => onToggle(option.value)}
          aria-label={option.label}
        />
        {option.label}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{option.count}</span>
    </label>
  );
}

function TogglePill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <Button type="button" variant={active ? "default" : "outline"} size="sm" onClick={onClick}>
      {label}
    </Button>
  );
}

function TripTime({
  city,
  label,
  time,
}: {
  city: string;
  label: string;
  time: string;
}): React.JSX.Element {
  return (
    <div>
      <p className="text-xs uppercase tracking-normal text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-semibold text-gray-950 dark:text-gray-50">{time}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{city}</p>
    </div>
  );
}

function Rating({ rating, reviews }: { rating: number; reviews: number }): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-900 dark:bg-brand-600/10 dark:text-brand-100">
      <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      {rating.toFixed(1)} · {reviews} reviews
    </span>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-gold-600 dark:text-gold-100" aria-hidden="true" />
      <span className="grid">
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
      </span>
    </div>
  );
}

function toggleValue<TValue extends string>(current: TValue[], value: TValue): TValue[] {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return `${hours}h ${remaining}m`;
}
