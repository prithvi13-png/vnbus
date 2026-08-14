"use client";

import * as React from "react";
import {
  Archive,
  Bell,
  CheckCheck,
  Cpu,
  Heart,
  Mail,
  Route,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
  Progress,
  StatusChip,
} from "@vnbus/ui";
import type { SearchSuggestionRecord } from "@vnbus/types";

import { useMilestoneNineStore } from "../lib/milestone-nine-store";

const suggestions: SearchSuggestionRecord[] = [
  suggestion("Bangalore", "Hyderabad", 420),
  suggestion("Chennai", "Coimbatore", 392),
  suggestion("Pune", "Goa", 341),
  suggestion("Mumbai", "Pune", 318),
  suggestion("Delhi", "Jaipur", 286),
];

export function NotificationDrawer(): React.JSX.Element {
  const { archiveNotification, deleteNotification, markAllRead, notifications } =
    useMilestoneNineStore();
  const active = notifications.filter((notification) => notification.readStatus !== "ARCHIVED");
  const unread = active.filter((notification) => notification.readStatus === "UNREAD").length;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button type="button" variant="outline" className="relative">
          <Bell className="h-4 w-4" aria-hidden="true" />
          Notifications
          {unread ? (
            <span className="absolute -right-2 -top-2 rounded-full bg-blue-700 px-1.5 py-0.5 text-xs font-semibold text-white">
              {unread}
            </span>
          ) : null}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Notification Center</DrawerTitle>
          <DrawerDescription>
            In-app, email, push, SMS, and WhatsApp-ready history.
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-3 overflow-y-auto p-5">
          <Button type="button" variant="outline" className="w-fit" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Mark All Read
          </Button>
          {active.map((notification) => (
            <div
              key={notification.id}
              className="grid gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-950 dark:text-gray-50">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {notification.body}
                  </p>
                </div>
                <Badge variant={notification.readStatus === "UNREAD" ? "default" : "neutral"}>
                  {notification.readStatus}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => archiveNotification(notification.id)}
                >
                  <Archive className="h-4 w-4" aria-hidden="true" />
                  Archive
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function RecommendationCards(): React.JSX.Element {
  const recommendations = useMilestoneNineStore((state) => state.recommendations);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {recommendations.map((recommendation) => (
        <Card key={recommendation.recommendationId}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Sparkles className="h-5 w-5 text-blue-700" aria-hidden="true" />
              <StatusChip tone="success">
                {Math.round(recommendation.confidenceScore * 100)}%
              </StatusChip>
            </div>
            <CardTitle>{recommendation.title}</CardTitle>
            <CardDescription>{recommendation.route}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Fare</span>
              <span className="font-semibold">
                INR {recommendation.fare.amount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Duration</span>
              <span className="font-semibold">
                {Math.floor(recommendation.durationMinutes / 60)}h{" "}
                {recommendation.durationMinutes % 60}m
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{recommendation.reason}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function SearchSuggestionsPanel(): React.JSX.Element {
  const [query, setQuery] = React.useState("");
  const { addRecentSearch, favoriteRoutes, recentSearches, toggleFavoriteRoute } =
    useMilestoneNineStore();
  const filtered = suggestions.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Search Suggestions</CardTitle>
          <CardDescription>
            Autocomplete, popular search cache, and recent route cache.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Search route"
            />
          </div>
          <div className="grid gap-2">
            {filtered.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800"
              >
                <div>
                  <p className="font-medium text-gray-950 dark:text-gray-50">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.searchCount} searches</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addRecentSearch(item)}
                  >
                    <Route className="h-4 w-4" aria-hidden="true" />
                    Recent
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Favorite ${item.label}`}
                    onClick={() => toggleFavoriteRoute(item)}
                  >
                    <Heart className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <RouteList title="Recently Viewed" rows={recentSearches} />
        <RouteList title="Favorite Routes" rows={favoriteRoutes} />
      </div>
    </section>
  );
}

export function AdminHealthDashboard(): React.JSX.Element {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Queue Health</CardTitle>
          <CardDescription>BullMQ retry and dead-letter overview.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {[
            ["Email Queue", 82, "DEGRADED"],
            ["Notification Queue", 76, "DEGRADED"],
            ["AI Queue", 91, "HEALTHY"],
          ].map(([label, value, status]) => (
            <HealthRow
              key={label}
              label={String(label)}
              value={Number(value)}
              status={String(status)}
            />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cache Status</CardTitle>
          <CardDescription>Redis hit-rate and warm namespace state.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {[
            ["Search Results", 88, "HEALTHY"],
            ["Feature Flags", 96, "HEALTHY"],
            ["Analytics", 63, "DEGRADED"],
          ].map(([label, value, status]) => (
            <HealthRow
              key={label}
              label={String(label)}
              value={Number(value)}
              status={String(status)}
            />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Observability</CardTitle>
          <CardDescription>Structured logs, trace IDs, and mock resource usage.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <HealthRow label="API Response" value={92} status="HEALTHY" />
          <HealthRow label="Memory" value={61} status="HEALTHY" />
          <HealthRow label="CPU" value={42} status="HEALTHY" />
        </CardContent>
      </Card>
    </section>
  );
}

export function MilestoneNineSearchWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-blue-700 dark:text-blue-300">
            Recommendations
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-gray-50">
            Suggested Journeys
          </h2>
        </div>
        <NotificationDrawer />
      </div>
      <RecommendationCards />
      <SearchSuggestionsPanel />
    </div>
  );
}

function RouteList({
  rows,
  title,
}: {
  rows: SearchSuggestionRecord[];
  title: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <span>{row.label}</span>
              <Badge variant="neutral">{row.searchCount}</Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No routes yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function HealthRow({
  label,
  status,
  value,
}: {
  label: string;
  status: string;
  value: number;
}): React.JSX.Element {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-gray-950 dark:text-gray-50">
          {status === "HEALTHY" ? (
            <Cpu className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Mail className="h-4 w-4" aria-hidden="true" />
          )}
          {label}
        </span>
        <span className={status === "HEALTHY" ? "text-emerald-700" : "text-amber-700"}>
          {status}
        </span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function suggestion(
  sourceCity: string,
  destinationCity: string,
  searchCount: number,
): SearchSuggestionRecord {
  return {
    label: `${sourceCity} to ${destinationCity}`,
    sourceCity,
    destinationCity,
    searchCount,
  };
}
