"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Copy,
  Download,
  HelpCircle,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Ticket,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  AgentBookingRecord,
  AgentCustomerRecord,
  AgentDashboardResponse,
  AgentReportsResponse,
  BusSearchResult,
  NotificationRecord,
  SeatLayoutDetails,
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
  DataTable,
  EmptyState,
  Input,
  StatusChip,
  Textarea,
  type DataTableColumn,
} from "@vnbus/ui";
import { todayIsoDate } from "@vnbus/shared";

import {
  cancelBooking,
  createAgentBooking,
  createAgentCustomer,
  deleteAgentCustomer,
  emailAgentTicket,
  getAgentDashboard,
  getAgentReports,
  getSeatLayout,
  holdSeats,
  listAgentBookings,
  listAgentCustomers,
  listAgentNotifications,
  rescheduleBooking,
  searchBuses,
  updateAgentCustomer,
} from "../lib/api-client";
import { useAgentStore } from "../lib/agent-store";
import { useBookingStore } from "../lib/booking-store";
import { PageHeader } from "./page-header";

const chartColors = ["#2563eb", "#059669", "#f59e0b", "#dc2626", "#7c3aed"];

export function AgentDashboardWorkspace(): React.JSX.Element {
  const [dashboard, setDashboard] = React.useState<AgentDashboardResponse | null>(null);

  React.useEffect(() => {
    void getAgentDashboard().then(setDashboard);
  }, []);

  const metrics = dashboard?.metrics;

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Travel Agent"
        title="Agent Dashboard"
        description="High-volume workspace for quick bookings, ticket actions, customers, and reports."
        actionHref="/agent/quick-booking"
        actionLabel="Quick Booking"
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Today's Bookings" value={`${metrics?.todaysBookings ?? 0}`} />
        <MetricTile label="Upcoming Journeys" value={`${metrics?.upcomingJourneys ?? 0}`} />
        <MetricTile
          label="Today's Revenue"
          value={`INR ${(metrics?.todaysRevenue.amount ?? 0).toLocaleString("en-IN")}`}
        />
        <MetricTile label="Cancelled Bookings" value={`${metrics?.cancelledBookings ?? 0}`} />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Booking Trend</CardTitle>
            <CardDescription>Mock operational demand for this week.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={agentTrendData}>
                <defs>
                  <linearGradient id="agentRevenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#2563eb"
                  fill="url(#agentRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Summary</CardTitle>
            <CardDescription>Confirmed, pending, rescheduled, and cancelled mix.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(dashboard?.bookingStatusSummary ?? []).map((item) => ({
                    name: item.status.replaceAll("_", " "),
                    value: item.count,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={92}
                  label
                >
                  {(dashboard?.bookingStatusSummary ?? []).map((item, index) => (
                    <Cell
                      key={item.status}
                      fill={chartColors[index % chartColors.length] ?? "#2563eb"}
                    />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popular Routes</CardTitle>
            <CardDescription>Routes agents use most often.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={routeColumns}
              data={(dashboard?.popularRoutes ?? []).map((route) => ({
                id: route.route,
                route: route.route,
                bookings: route.bookings,
                revenue: `INR ${route.revenue.amount.toLocaleString("en-IN")}`,
              }))}
              pageSize={5}
              selectable={false}
              exportable
              exportFileName="agent-popular-routes"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live operational feed for the agency desk.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(dashboard?.recentActivity ?? []).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800"
              >
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-gray-950 dark:text-gray-50">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function AgentQuickBookingWorkspace(): React.JSX.Element {
  const addRecentSearch = useAgentStore((state) => state.addRecentSearch);
  const addRecentCustomer = useAgentStore((state) => state.addRecentCustomer);
  const setConfirmation = useBookingStore((state) => state.setConfirmation);
  const [customers, setCustomers] = React.useState<AgentCustomerRecord[]>([]);
  const [results, setResults] = React.useState<BusSearchResult[]>([]);
  const [selectedTrip, setSelectedTrip] = React.useState<BusSearchResult | null>(null);
  const [layout, setLayout] = React.useState<SeatLayoutDetails | null>(null);
  const [selectedSeats, setSelectedSeats] = React.useState<string[]>([]);
  const [customerId, setCustomerId] = React.useState("CUS-AGT-001");
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState({
    sourceCity: "Bangalore",
    destinationCity: "Hyderabad",
    journeyDate: todayIsoDate(),
    passengerCount: 1,
  });

  React.useEffect(() => {
    void listAgentCustomers({ pageSize: 50 }).then((response) => {
      setCustomers(response.customers);
      if (response.customers[0]) {
        setCustomerId(response.customers[0].customerId);
      }
    });
  }, []);

  async function runSearch(): Promise<void> {
    setError(null);
    setStatus("Searching mock buses...");
    const response = await searchBuses(search);
    setResults(response.buses);
    addRecentSearch(search);
    setStatus(`${response.buses.length} buses found`);
  }

  async function chooseTrip(trip: BusSearchResult): Promise<void> {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setLayout(await getSeatLayout(trip.tripId, search.journeyDate));
  }

  async function createBooking(): Promise<void> {
    if (!selectedTrip || !layout || !selectedSeats.length) {
      setError("Select a bus and at least one seat.");
      return;
    }
    const customer = customers.find((item) => item.customerId === customerId);
    if (!customer) {
      setError("Select a customer.");
      return;
    }

    try {
      setError(null);
      setStatus("Holding seats...");
      const hold = await holdSeats({
        supplierCode: selectedTrip.supplierCode,
        tripId: selectedTrip.tripId,
        journeyDate: search.journeyDate,
        seatNumbers: selectedSeats,
      });
      setStatus("Creating booking and generating ticket...");
      const response = await createAgentBooking({
        reservationId: hold.reservationId,
        supplierCode: selectedTrip.supplierCode,
        tripId: selectedTrip.tripId,
        journeyDate: search.journeyDate,
        selectedSeats,
        boardingPointId: layout.boardingPoints[0]?.id ?? "",
        droppingPointId: layout.droppingPoints[0]?.id ?? "",
        passengers: selectedSeats.map((seatNumber) => ({
          seatNumber,
          firstName: customer.name.split(" ")[0] ?? customer.name,
          lastName: customer.name.split(" ").slice(1).join(" ") || "Traveller",
          age: 30,
          gender: customer.gender,
          phone: customer.phone,
          email: customer.email,
          ...(customer.emergencyContact ? { emergencyContact: customer.emergencyContact } : {}),
        })),
        customerId: customer.customerId,
        emailTicket: true,
      });

      setConfirmation({ booking: response.booking, ticket: response.ticket });
      addRecentCustomer(response.customer);
      setStatus(`Ticket ${response.ticket.ticketNumber} generated and emailed.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Booking failed");
      setStatus(null);
    }
  }

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Agent"
        title="Quick Booking"
        description="Search, select seats, attach a customer, generate ticket, and email it from one desk."
      />
      {error ? (
        <Alert variant="danger">
          <AlertTitle>Booking failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {status ? (
        <Alert>
          <AlertTitle>Quick booking status</AlertTitle>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Search Bus</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input
            aria-label="Source"
            value={search.sourceCity}
            onChange={(event) => setSearch({ ...search, sourceCity: event.target.value })}
          />
          <Input
            aria-label="Destination"
            value={search.destinationCity}
            onChange={(event) => setSearch({ ...search, destinationCity: event.target.value })}
          />
          <Input
            aria-label="Journey Date"
            type="date"
            value={search.journeyDate}
            onChange={(event) => setSearch({ ...search, journeyDate: event.target.value })}
          />
          <Input
            aria-label="Passengers"
            type="number"
            min={1}
            max={6}
            value={search.passengerCount}
            onChange={(event) =>
              setSearch({ ...search, passengerCount: Number(event.target.value) })
            }
          />
          <Button type="button" onClick={() => void runSearch()}>
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </Button>
        </CardContent>
      </Card>
      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Available Buses</CardTitle>
            <CardDescription>Results come from the existing mock search module.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {results.length ? (
              results.slice(0, 6).map((trip) => (
                <button
                  key={trip.tripId}
                  type="button"
                  className="rounded-md border border-gray-200 p-4 text-left transition hover:border-blue-500 dark:border-gray-800"
                  onClick={() => void chooseTrip(trip)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950 dark:text-gray-50">
                        {trip.operatorName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {trip.sourceCity} to {trip.destinationCity} · {trip.busType}
                      </p>
                    </div>
                    <Badge variant={selectedTrip?.tripId === trip.tripId ? "success" : "neutral"}>
                      INR {trip.fare.amount.toLocaleString("en-IN")}
                    </Badge>
                  </div>
                </button>
              ))
            ) : (
              <EmptyState
                title="Search to begin"
                description="Bus results will appear here after agents run a route search."
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create Booking</CardTitle>
            <CardDescription>Seats and ticketing reuse M6 services.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <label className="grid gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Customer
              <select
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
              >
                {customers.map((customer) => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.name} · {customer.phone}
                  </option>
                ))}
              </select>
            </label>
            {layout ? (
              <div className="grid gap-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Seats</p>
                <div className="grid grid-cols-4 gap-2">
                  {layout.decks
                    .flatMap((deck) => deck.seats)
                    .filter((seat) => seat.status === "AVAILABLE")
                    .slice(0, 16)
                    .map((seat) => {
                      const selected = selectedSeats.includes(seat.seatNumber);

                      return (
                        <button
                          key={seat.seatNumber}
                          type="button"
                          aria-pressed={selected}
                          className={`h-10 rounded-md border text-sm font-semibold ${
                            selected
                              ? "border-blue-700 bg-blue-700 text-white"
                              : "border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                          }`}
                          onClick={() =>
                            setSelectedSeats((current) =>
                              current.includes(seat.seatNumber)
                                ? current.filter((item) => item !== seat.seatNumber)
                                : [...current, seat.seatNumber].slice(0, search.passengerCount),
                            )
                          }
                        >
                          {seat.seatNumber}
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : null}
            <Button type="button" onClick={() => void createBooking()}>
              <Ticket className="h-4 w-4" aria-hidden="true" />
              Generate & Email Ticket
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function AgentCustomersWorkspace(): React.JSX.Element {
  const customerFilters = useAgentStore((state) => state.customerFilters);
  const setCustomerFilters = useAgentStore((state) => state.setCustomerFilters);
  const addRecentCustomer = useAgentStore((state) => state.addRecentCustomer);
  const [customers, setCustomers] = React.useState<AgentCustomerRecord[]>([]);
  const [status, setStatus] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    tags: "VIP",
  });

  const refresh = React.useCallback(async () => {
    const response = await listAgentCustomers({ ...customerFilters, pageSize: 50 });
    setCustomers(response.customers);
  }, [customerFilters]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addCustomer(): Promise<void> {
    const customer = await createAgentCustomer({
      name: draft.name || "New Traveller",
      email: draft.email || `traveller${Date.now()}@example.com`,
      phone: draft.phone || "+919900000010",
      gender: "OTHER",
      preferredRoutes: ["Bangalore to Hyderabad"],
      notes: draft.notes,
      tags: draft.tags.split(",").map((tag) => tag.trim()),
    });
    addRecentCustomer(customer);
    setStatus(`${customer.name} added.`);
    setDraft({ name: "", email: "", phone: "", notes: "", tags: "VIP" });
    await refresh();
  }

  const rows = customers.map((customer) => ({
    id: customer.customerId,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    tags: customer.tags.map((tag) => tag.label).join(", "),
    bookings: customer.bookingCount,
    value: `INR ${customer.lifetimeValue.amount.toLocaleString("en-IN")}`,
    status: customer.status,
  }));

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Agent"
        title="Customers"
        description="Search, create, update, tag, note, and manage traveller profiles."
      />
      {status ? (
        <Alert>
          <AlertTitle>Customer updated</AlertTitle>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Add Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input
            aria-label="Customer name"
            placeholder="Name"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
          <Input
            aria-label="Customer email"
            placeholder="Email"
            value={draft.email}
            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
          />
          <Input
            aria-label="Customer phone"
            placeholder="Phone"
            value={draft.phone}
            onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
          />
          <Input
            aria-label="Customer tags"
            placeholder="Tags"
            value={draft.tags}
            onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
          />
          <Button type="button" onClick={() => void addCustomer()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Button>
          <Textarea
            className="md:col-span-5"
            aria-label="Customer notes"
            placeholder="Customer notes"
            value={draft.notes}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Customers List</CardTitle>
          <CardDescription>
            Enterprise table with search, sorting, pagination, columns, and export.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={customerColumns}
            data={rows}
            pageSize={8}
            exportable
            exportFileName="agent-customers"
            filterContent={
              <select
                aria-label="Customer status filter"
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
                value={customerFilters.status ?? ""}
                onChange={(event) =>
                  setCustomerFilters(
                    event.target.value
                      ? {
                          ...customerFilters,
                          status: event.target.value as AgentCustomerRecord["status"],
                        }
                      : omitKey(customerFilters, "status"),
                  )
                }
              >
                <option value="">All status</option>
                <option value="ACTIVE">Active</option>
                <option value="VIP">VIP</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            }
          />
        </CardContent>
      </Card>
      <section className="grid gap-3 md:grid-cols-2">
        {customers.slice(0, 2).map((customer) => (
          <Card key={customer.customerId}>
            <CardHeader>
              <CardTitle>{customer.name}</CardTitle>
              <CardDescription>{customer.email}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  void updateAgentCustomer(customer.customerId, {
                    notes: "Followed up from agent portal.",
                  }).then(refresh)
                }
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Add Note
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  void deleteAgentCustomer(customer.customerId).then(() => {
                    setStatus(`${customer.name} deleted.`);
                    return refresh();
                  })
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

export function AgentBookingsWorkspace(): React.JSX.Element {
  const bookingFilters = useAgentStore((state) => state.bookingFilters);
  const setBookingFilters = useAgentStore((state) => state.setBookingFilters);
  const upsertBooking = useBookingStore((state) => state.upsertBooking);
  const [records, setRecords] = React.useState<AgentBookingRecord[]>([]);
  const [status, setStatus] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    const response = await listAgentBookings({ ...bookingFilters, pageSize: 50 });
    setRecords(response.bookings);
  }, [bookingFilters]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function cancel(record: AgentBookingRecord): Promise<void> {
    const response = await cancelBooking({
      bookingId: record.booking.bookingId,
      reason: "Cancelled from agent portal.",
    });
    upsertBooking(response.booking);
    setStatus(`${record.booking.bookingReference} cancelled.`);
    await refresh();
  }

  async function reschedule(record: AgentBookingRecord): Promise<void> {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 14);
    const response = await rescheduleBooking({
      bookingId: record.booking.bookingId,
      newJourneyDate: date.toISOString().slice(0, 10),
    });
    upsertBooking(response.booking);
    setStatus(`${record.booking.bookingReference} rescheduled.`);
    await refresh();
  }

  const rows = records.map((record) => ({
    id: record.booking.bookingId,
    reference: record.booking.bookingReference,
    customer: record.customer?.name ?? record.booking.passengers[0]?.firstName ?? "Traveller",
    phone: record.customer?.phone ?? record.booking.passengers[0]?.phone ?? "",
    route: `${record.booking.trip.sourceCity} to ${record.booking.trip.destinationCity}`,
    operator: record.booking.trip.operatorName,
    date: formatDate(record.booking.trip.departureTime),
    status: record.booking.status,
    amount: `INR ${record.booking.fare.grandTotal.amount.toLocaleString("en-IN")}`,
  }));

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Agent"
        title="Bookings"
        description="Search, sort, filter, cancel, reschedule, email, download, and duplicate bookings."
        actionHref="/agent/quick-booking"
        actionLabel="Create Booking"
      />
      {status ? (
        <Alert>
          <AlertTitle>Booking updated</AlertTitle>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Bookings List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={bookingColumns}
            data={rows}
            pageSize={8}
            exportable
            exportFileName="agent-bookings"
            filterContent={
              <select
                aria-label="Booking status filter"
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
                value={bookingFilters.status ?? ""}
                onChange={(event) =>
                  setBookingFilters(
                    event.target.value
                      ? {
                          ...bookingFilters,
                          status: event.target.value as AgentBookingRecord["booking"]["status"],
                        }
                      : omitKey(bookingFilters, "status"),
                  )
                }
              >
                <option value="">All status</option>
                <option value="TICKET_GENERATED">Ticket generated</option>
                <option value="RESCHEDULED">Rescheduled</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="PENDING_PAYMENT">Pending payment</option>
              </select>
            }
          />
        </CardContent>
      </Card>
      <section className="grid gap-3">
        {records.map((record) => (
          <Card key={record.booking.bookingId}>
            <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold text-gray-950 dark:text-gray-50">
                  {record.booking.bookingReference}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {record.customer?.name ?? "Traveller"} · {record.booking.selectedSeats.join(", ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/ticket?bookingId=${record.booking.bookingId}`}>
                    <Ticket className="h-4 w-4" aria-hidden="true" />
                    Ticket
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/download-ticket?bookingId=${record.booking.bookingId}`}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void emailAgentTicket({
                      bookingId: record.booking.bookingId,
                      ...(record.customer?.email ? { to: record.customer.email } : {}),
                    }).then(() => setStatus("Ticket email queued."))
                  }
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void reschedule(record)}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Reschedule
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void cancel(record)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/agent/quick-booking">
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Duplicate
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!records.length ? (
          <EmptyState
            title="No agent bookings yet"
            description="Use quick booking to create an agent-owned mock booking."
            actionLabel="Quick booking"
            onAction={() => {
              window.location.href = "/agent/quick-booking";
            }}
          />
        ) : null}
      </section>
    </div>
  );
}

export function AgentReportsWorkspace(): React.JSX.Element {
  const [reports, setReports] = React.useState<AgentReportsResponse | null>(null);

  React.useEffect(() => {
    void getAgentReports().then(setReports);
  }, []);

  const trend = reports?.bookingTrends ?? [];

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Agent"
        title="Reports"
        description="Daily, weekly, monthly, route, customer, booking, revenue, cancellation, and journey analytics."
      />
      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Area dataKey="revenue" stroke="#059669" fill="#d1fae5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.cancellationTrends ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="cancellations" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Download CSV or PDF from the reusable table controls.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={topCustomerColumns}
            data={(reports?.topCustomers ?? []).map((customer) => ({
              id: customer.customerId,
              name: customer.name,
              bookings: customer.bookings,
              revenue: `INR ${customer.revenue.amount.toLocaleString("en-IN")}`,
            }))}
            exportable
            exportFileName="agent-top-customers"
            selectable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function AgentNotificationsWorkspace(): React.JSX.Element {
  const [notifications, setNotifications] = React.useState<NotificationRecord[]>([]);

  React.useEffect(() => {
    void listAgentNotifications().then(setNotifications);
  }, []);

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Agent"
        title="Notifications"
        description="Booking created, booking cancelled, journey reminder, and system notifications."
      />
      <section className="grid gap-3">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-950 dark:text-gray-50">
                      {notification.title}
                    </p>
                    <Badge variant={notification.readStatus === "UNREAD" ? "warning" : "neutral"}>
                      {notification.readStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notification.body}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setNotifications((current) =>
                    current.map((item) =>
                      item.id === notification.id
                        ? { ...item, readStatus: "READ", readAt: new Date().toISOString() }
                        : item,
                    ),
                  )
                }
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Mark Read
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

export function AgentProfileWorkspace(): React.JSX.Element {
  return (
    <AgentFormShell
      eyebrow="Agent"
      title="Profile"
      description="Update name, phone, email, profile image, and password placeholders."
      icon={UserRound}
      fields={["Nisha Rao", "+918045678899", "agent.ops@vriddhinexus.example", "Profile image URL"]}
    />
  );
}

export function AgentSettingsWorkspace(): React.JSX.Element {
  return (
    <AgentFormShell
      eyebrow="Agent"
      title="Settings"
      description="Agency name, address, contact details, business logo, email preferences, and notifications."
      icon={Settings}
      fields={[
        "Vriddhi Nexus Partner Desk",
        "Koramangala, Bengaluru",
        "+918045678899",
        "Business logo URL",
      ]}
    />
  );
}

export function AgentHelpWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Agent"
        title="Help"
        description="Operational help for quick booking, customer lookup, reports, ticket download, and email retry workflows."
      />
      <section className="grid gap-3 md:grid-cols-2">
        {[
          [
            "Quick Booking",
            "Search route, select seats, choose customer, generate and email ticket.",
          ],
          ["Customer Management", "Use notes and tags to speed repeat bookings."],
          ["Reports", "Download CSV/PDF exports from report tables."],
          ["Mock Mode", "Supplier, payment, ticket, and email flows remain mock-only in M7."],
        ].map(([title, body]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                {title}
              </CardTitle>
              <CardDescription>{body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}

function AgentFormShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  fields,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof UserRound;
  fields: string[];
}): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {fields.map((field) => (
            <Input key={field} aria-label={field} defaultValue={field} />
          ))}
          <Button type="button" className="md:w-fit">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

const agentTrendData = [
  { label: "Mon", bookings: 18, revenue: 28800 },
  { label: "Tue", bookings: 22, revenue: 34100 },
  { label: "Wed", bookings: 19, revenue: 30400 },
  { label: "Thu", bookings: 26, revenue: 41900 },
  { label: "Fri", bookings: 31, revenue: 50600 },
  { label: "Sat", bookings: 38, revenue: 64200 },
  { label: "Sun", bookings: 24, revenue: 38900 },
];

type RouteRow = Record<string, unknown> & {
  id: string;
  route: string;
  bookings: number;
  revenue: string;
};

const routeColumns: DataTableColumn<RouteRow>[] = [
  { id: "route", header: "Route", sortable: true },
  { id: "bookings", header: "Bookings", sortable: true, align: "right" },
  { id: "revenue", header: "Revenue", sortable: true, align: "right" },
];

type CustomerRow = Record<string, unknown> & {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string;
  bookings: number;
  value: string;
  status: string;
};

const customerColumns: DataTableColumn<CustomerRow>[] = [
  { id: "name", header: "Customer", sortable: true },
  { id: "phone", header: "Phone", sortable: true },
  { id: "email", header: "Email", sortable: true, hideOnMobile: true },
  { id: "tags", header: "Tags", sortable: true, hideOnMobile: true },
  { id: "bookings", header: "Bookings", sortable: true, align: "right" },
  { id: "value", header: "Value", sortable: true, align: "right" },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (row) => (
      <StatusChip tone={row.status === "BLOCKED" ? "danger" : "success"}>{row.status}</StatusChip>
    ),
  },
];

type BookingRow = Record<string, unknown> & {
  id: string;
  reference: string;
  customer: string;
  phone: string;
  route: string;
  operator: string;
  date: string;
  status: string;
  amount: string;
};

const bookingColumns: DataTableColumn<BookingRow>[] = [
  { id: "reference", header: "Booking ID", sortable: true },
  { id: "customer", header: "Customer", sortable: true },
  { id: "phone", header: "Phone", sortable: true, hideOnMobile: true },
  { id: "route", header: "Route", sortable: true },
  { id: "operator", header: "Operator", sortable: true, hideOnMobile: true },
  { id: "date", header: "Journey Date", sortable: true },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (row) => (
      <StatusChip tone={statusTone(row.status)}>{row.status.replaceAll("_", " ")}</StatusChip>
    ),
  },
  { id: "amount", header: "Amount", sortable: true, align: "right" },
];

type TopCustomerRow = Record<string, unknown> & {
  id: string;
  name: string;
  bookings: number;
  revenue: string;
};

const topCustomerColumns: DataTableColumn<TopCustomerRow>[] = [
  { id: "name", header: "Customer", sortable: true },
  { id: "bookings", header: "Bookings", sortable: true, align: "right" },
  { id: "revenue", header: "Revenue", sortable: true, align: "right" },
];

function statusTone(status: string): "neutral" | "info" | "success" | "warning" | "danger" {
  if (status.includes("CANCEL")) {
    return "danger";
  }
  if (status.includes("PENDING")) {
    return "warning";
  }
  if (status.includes("RESCHEDULE")) {
    return "info";
  }

  return "success";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function omitKey<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const next = { ...value };
  delete next[key];

  return next;
}
