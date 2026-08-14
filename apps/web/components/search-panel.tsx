"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, CalendarDays, Clock3, MapPin, MapPinned, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Autocomplete, Badge, Button, Input, Tag, cn, type AutocompleteOption } from "@vnbus/ui";
import { buildSearchParams, getPopularRoutes, normalizeCity, POPULAR_CITIES } from "@vnbus/shared";

import { searchSchema, type SearchFormValues } from "../lib/search-schema";
import { useSearchStore } from "../lib/search-store";

const cityOptions: AutocompleteOption[] = POPULAR_CITIES.map((city) => ({
  label: city,
  value: city,
  description: "Popular city",
}));

const popularRoutes = getPopularRoutes(8);

export function SearchPanel({
  className,
  compact = false,
  initialValues,
}: {
  className?: string;
  compact?: boolean;
  initialValues?: SearchFormValues;
}): React.JSX.Element {
  const router = useRouter();
  const lastSearch = useSearchStore((state) => state.lastSearch);
  const recentSearches = useSearchStore((state) => state.recentSearches);
  const addRecentSearch = useSearchStore((state) => state.addRecentSearch);
  const setLastSearch = useSearchStore((state) => state.setLastSearch);
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: initialValues ?? lastSearch,
  });
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = form;
  const sourceCity = watch("sourceCity");
  const destinationCity = watch("destinationCity");

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const submitSearch = (values: SearchFormValues): void => {
    const request = {
      ...values,
      sourceCity: normalizeCity(values.sourceCity),
      destinationCity: normalizeCity(values.destinationCity),
      passengerCount: 1,
      page: 1,
      pageSize: 12,
    };
    const params = buildSearchParams(request);

    setLastSearch(request);
    addRecentSearch(request);
    router.push(`/search?${params.toString()}`);
  };

  const applyRoute = (source: string, destination: string): void => {
    setValue("sourceCity", source, { shouldValidate: true });
    setValue("destinationCity", destination, { shouldValidate: true });
  };

  return (
    <div className={cn("grid gap-4", className)}>
      <form
        onSubmit={(event) => {
          void handleSubmit(submitSearch)(event);
        }}
        className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-soft dark:border-gray-800 dark:bg-gray-950 lg:grid-cols-[1fr_auto_1fr_180px_auto]"
      >
        <Field
          label="From city"
          icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
          error={errors.sourceCity?.message}
        >
          <Controller
            control={control}
            name="sourceCity"
            render={({ field }) => (
              <CityAutocomplete
                value={field.value}
                placeholder="Bangalore"
                onChange={field.onChange}
              />
            )}
          />
        </Field>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="self-end"
          aria-label="Swap source and destination"
          onClick={() => {
            setValue("sourceCity", destinationCity, { shouldValidate: true });
            setValue("destinationCity", sourceCity, { shouldValidate: true });
          }}
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Field
          label="To city"
          icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
          error={errors.destinationCity?.message}
        >
          <Controller
            control={control}
            name="destinationCity"
            render={({ field }) => (
              <CityAutocomplete
                value={field.value}
                placeholder="Hyderabad"
                onChange={field.onChange}
              />
            )}
          />
        </Field>
        <Field
          label="Journey date"
          icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
          error={errors.journeyDate?.message}
        >
          <Input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            {...register("journeyDate")}
          />
        </Field>
        <Button type="submit" className={compact ? "self-end" : "h-11 self-end"}>
          <Search className="h-4 w-4" aria-hidden="true" />
          Search
        </Button>
      </form>

      {!compact ? (
        <div className="grid gap-3 md:grid-cols-2">
          <QuickList title="Popular Cities">
            <div className="flex flex-wrap gap-2">
              {POPULAR_CITIES.slice(0, 10).map((city) => (
                <button
                  key={city}
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-200"
                  onClick={() => setValue("sourceCity", city, { shouldValidate: true })}
                >
                  {city}
                </button>
              ))}
            </div>
          </QuickList>
          <QuickList title="Popular Routes">
            <div className="grid gap-2 sm:grid-cols-2">
              {popularRoutes.slice(0, 6).map((route) => (
                <button
                  key={route.id}
                  type="button"
                  className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white p-2 text-left text-xs hover:border-blue-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-500"
                  onClick={() => applyRoute(route.sourceCity, route.destinationCity)}
                >
                  <span className="grid">
                    <span className="font-semibold text-gray-950 dark:text-gray-50">
                      {route.sourceCity} to {route.destinationCity}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {Math.round(route.durationMinutes / 60)}h · {route.distanceKm} km
                    </span>
                  </span>
                  <MapPinned
                    className="h-4 w-4 text-blue-700 dark:text-blue-300"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </QuickList>
          {recentSearches.length ? (
            <QuickList title="Recent Searches" className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <Button
                    key={`${search.sourceCity}-${search.destinationCity}-${search.journeyDate}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      reset(search);
                      submitSearch(search);
                    }}
                  >
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {search.sourceCity} to {search.destinationCity}
                  </Button>
                ))}
              </div>
            </QuickList>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CityAutocomplete({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}): React.JSX.Element {
  const debouncedValue = useDebouncedValue(value, 120);
  const options = React.useMemo(
    () =>
      cityOptions.filter((option) =>
        option.label.toLowerCase().includes(debouncedValue.trim().toLowerCase()),
      ),
    [debouncedValue],
  );

  return (
    <Autocomplete
      options={options.length ? options : cityOptions}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
}

function Field({
  children,
  error,
  icon,
  label,
}: {
  children: React.ReactNode;
  error: string | undefined;
  icon: React.ReactNode;
  label: string;
}): React.JSX.Element {
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-normal text-gray-600 dark:text-gray-400">
        {icon}
        {label}
      </span>
      {children}
      <span className="min-h-4 text-xs text-red-600 dark:text-red-300">{error}</span>
    </label>
  );
}

function QuickList({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
}): React.JSX.Element {
  return (
    <section
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="neutral">{title}</Badge>
        <Tag>{title === "Popular Cities" ? "Autocomplete" : "Mock data"}</Tag>
      </div>
      {children}
    </section>
  );
}

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs, value]);

  return debounced;
}
