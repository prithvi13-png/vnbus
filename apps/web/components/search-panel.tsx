"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, CalendarDays, MapPin, MapPinned, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Autocomplete, Button, Input, cn, type AutocompleteOption } from "@vnbus/ui";
import { buildSearchParams, getPopularRoutes, normalizeCity, POPULAR_CITIES } from "@vnbus/shared";

import { searchSchema, type SearchFormValues } from "../lib/search-schema";
import { useSearchStore } from "../lib/search-store";

const cityOptions: AutocompleteOption[] = POPULAR_CITIES.map((city) => ({
  label: city,
  value: city,
  description: "Popular city",
}));

const popularRoutes = getPopularRoutes(6);

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
        className="grid gap-3 rounded-lg border border-gold-100 bg-white p-4 shadow-sm dark:border-brand-900 dark:bg-brand-950 lg:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)_180px_auto]"
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

      {!compact ? <QuickRoutes routes={popularRoutes} onSelect={applyRoute} /> : null}
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
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-normal text-brand-700 dark:text-brand-100">
        {icon}
        {label}
      </span>
      {children}
      <span className="min-h-4 text-xs text-red-600 dark:text-red-300">{error}</span>
    </label>
  );
}

function QuickRoutes({
  onSelect,
  routes,
}: {
  onSelect: (source: string, destination: string) => void;
  routes: typeof popularRoutes;
}): React.JSX.Element {
  return (
    <section className="rounded-lg border border-gold-100 bg-white p-3 shadow-sm dark:border-brand-900 dark:bg-brand-950">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-brand-900 dark:text-white">Popular routes</h2>
        <div className="flex flex-wrap gap-2">
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-xs font-medium text-brand-800 hover:border-gold-200 hover:bg-gold-50 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-100 dark:hover:border-gold-500"
              onClick={() => onSelect(route.sourceCity, route.destinationCity)}
            >
              <MapPinned
                className="h-3.5 w-3.5 text-gold-600 dark:text-gold-100"
                aria-hidden="true"
              />
              {route.sourceCity} to {route.destinationCity}
            </button>
          ))}
        </div>
      </div>
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
