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
  listAgentBookings,
  listAgentCustomers,
  listAgentNotifications,
  searchBuses,
  updateAgentCustomer,
} from "../lib/api-client";
import { useAgentStore } from "../lib/agent-store";
import { useAuthStore } from "../lib/auth-store";
import { useBookingStore } from "../lib/booking-store";
import { PageHeader } from "./page-header";
import { CityAutocomplete } from "./search-panel";

const chartColors = ["#02553E", "#B88327", "#037A58", "#9F6F20", "#dc2626"];

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
      <section className="grid gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Summary</CardTitle>
            <CardDescription>Your bookings by status.</CardDescription>
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
                      fill={chartColors[index % chartColors.length] ?? "#B88327"}
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
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold-500" aria-hidden="true" />
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

interface QuickPassenger {
  firstName: string;
  lastName: string;
  age: string;
  gender: "MALE" | "FEMALE" | "OTHER";
}

const emptyPassenger: QuickPassenger = { firstName: "", lastName: "", age: "", gender: "MALE" };

export function AgentQuickBookingWorkspace(): React.JSX.Element {
  const addRecentSearch = useAgentStore((state) => state.addRecentSearch);
  const addRecentCustomer = useAgentStore((state) => state.addRecentCustomer);
  const setConfirmation = useBookingStore((state) => state.setConfirmation);
  const [customers, setCustomers] = React.useState<AgentCustomerRecord[]>([]);
  const [results, setResults] = React.useState<BusSearchResult[]>([]);
  const [selectedTrip, setSelectedTrip] = React.useState<BusSearchResult | null>(null);
  const [layout, setLayout] = React.useState<SeatLayoutDetails | null>(null);
  const [selectedSeats, setSelectedSeats] = React.useState<string[]>([]);
  const [passengers, setPassengers] = React.useState<Record<string, QuickPassenger>>({});
  const [boardingPointId, setBoardingPointId] = React.useState("");
  const [droppingPointId, setDroppingPointId] = React.useState("");
  const [customerId, setCustomerId] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [search, setSearch] = React.useState({
    sourceCity: "",
    destinationCity: "",
    journeyDate: todayIsoDate(),
    passengerCount: 1,
  });

  React.useEffect(() => {
    void listAgentCustomers({ pageSize: 100 }).then((response) => {
      setCustomers(response.customers);
      setCustomerId((current) => current || response.customers[0]?.customerId || "");
    });
  }, []);

  async function runSearch(): Promise<void> {
    try {
      setError(null);
      setStatus("Searching buses...");
      setSelectedTrip(null);
      setLayout(null);
      const response = await searchBuses(search);
      setResults(response.buses);
      addRecentSearch(search);
      setStatus(
        response.buses.length
          ? `${response.buses.length} buses found`
          : (response.notice ?? "No buses found."),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Search failed");
      setStatus(null);
    }
  }

  async function chooseTrip(trip: BusSearchResult): Promise<void> {
    try {
      setError(null);
      setSelectedTrip(trip);
      setSelectedSeats([]);
      setPassengers({});
      const seatLayout = await getSeatLayout(trip.tripId, search.journeyDate);
      setLayout(seatLayout);
      setBoardingPointId(seatLayout.boardingPoints[0]?.id ?? "");
      setDroppingPointId(seatLayout.droppingPoints[0]?.id ?? "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Seats could not be loaded");
    }
  }

  function toggleSeat(seatNumber: string): void {
    const maxSeats = layout?.maxSelectableSeats || 6;

    setSelectedSeats((current) =>
      current.includes(seatNumber)
        ? current.filter((item) => item !== seatNumber)
        : [...current, seatNumber].slice(0, maxSeats),
    );
    setPassengers((current) => ({
      ...current,
      [seatNumber]: current[seatNumber] ?? emptyPassenger,
    }));
  }

  function updatePassenger(seatNumber: string, patch: Partial<QuickPassenger>): void {
    setPassengers((current) => ({
      ...current,
      [seatNumber]: { ...(current[seatNumber] ?? emptyPassenger), ...patch },
    }));
  }

  async function createBooking(): Promise<void> {
    const customer = customers.find((item) => item.customerId === customerId);

    if (!selectedTrip || !layout || !selectedSeats.length) {
      setError("Select a bus and at least one seat.");
      return;
    }
    if (!customer) {
      setError("Select the customer this booking is for.");
      return;
    }

    // Every traveller's name and age go on the ticket, so they are typed in
    // for each seat rather than guessed from the customer record.
    const incomplete = selectedSeats.find((seat) => {
      const passenger = passengers[seat];
      const age = Number(passenger?.age);

      return (
        !passenger?.firstName.trim() ||
        !passenger.lastName.trim() ||
        !Number.isInteger(age) ||
        age < 1 ||
        age > 110
      );
    });
    if (incomplete) {
      setError(`Enter the name and age of the traveller in seat ${incomplete}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setStatus("Booking with the operator...");
      const response = await createAgentBooking({
        supplierCode: selectedTrip.supplierCode,
        tripId: selectedTrip.tripId,
        journeyDate: search.journeyDate,
        selectedSeats,
        boardingPointId,
        droppingPointId,
        passengers: selectedSeats.map((seatNumber) => {
          const passenger = passengers[seatNumber] ?? emptyPassenger;

          return {
            seatNumber,
            firstName: passenger.firstName.trim(),
            lastName: passenger.lastName.trim(),
            age: Number(passenger.age),
            gender: passenger.gender,
            phone: customer.phone,
            email: customer.email,
            ...(customer.emergencyContact ? { emergencyContact: customer.emergencyContact } : {}),
          };
        }),
        customerId: customer.customerId,
        emailTicket: true,
      });

      setConfirmation({ booking: response.booking, ticket: response.ticket });
      addRecentCustomer(response.customer);
      setStatus(
        `Ticket ${response.ticket.ticketNumber} (PNR ${response.ticket.pnr}) issued and emailed.`,
      );
      setSelectedSeats([]);
      setPassengers({});
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Booking failed");
      setStatus(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Agent"
        title="Quick Booking"
        description="Search, pick seats, enter the travellers, and issue the ticket for one of your customers."
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
        <CardContent className="grid gap-3 md:grid-cols-4">
          <CityAutocomplete
            value={search.sourceCity}
            placeholder="Leaving from"
            onChange={(sourceCity) => setSearch({ ...search, sourceCity })}
          />
          <CityAutocomplete
            value={search.destinationCity}
            placeholder="Going to"
            onChange={(destinationCity) => setSearch({ ...search, destinationCity })}
          />
          <Input
            aria-label="Journey Date"
            type="date"
            min={todayIsoDate()}
            value={search.journeyDate}
            onChange={(event) => setSearch({ ...search, journeyDate: event.target.value })}
          />
          <Button
            type="button"
            disabled={!search.sourceCity.trim() || !search.destinationCity.trim()}
            onClick={() => void runSearch()}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </Button>
        </CardContent>
      </Card>
      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Available Buses</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {results.length ? (
              results.slice(0, 20).map((trip) => (
                <button
                  key={trip.tripId}
                  type="button"
                  className="rounded-md border border-gray-200 p-4 text-left transition hover:border-gold-500 dark:border-gray-800"
                  onClick={() => void chooseTrip(trip)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950 dark:text-gray-50">
                        {trip.operatorName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {trip.busType} · departs {formatTime(trip.departureTime)} ·{" "}
                        {trip.availableSeats} seats
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
                description="Bus results appear here after you search a route."
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create Booking</CardTitle>
            <CardDescription>The ticket is emailed to the customer you choose.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {customers.length ? (
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
            ) : (
              <EmptyState
                title="Add a customer first"
                description="Bookings are made for one of your customers."
                actionLabel="Add customer"
                onAction={() => {
                  window.location.href = "/agent/customers";
                }}
              />
            )}
            {layout ? (
              <>
                <PointSelect
                  label="Boarding point"
                  points={layout.boardingPoints}
                  value={boardingPointId}
                  onChange={setBoardingPointId}
                />
                <PointSelect
                  label="Dropping point"
                  points={layout.droppingPoints}
                  value={droppingPointId}
                  onChange={setDroppingPointId}
                />
                <div className="grid gap-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Select Seats
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {layout.decks
                      .flatMap((deck) => deck.seats)
                      .filter((seat) => seat.status === "AVAILABLE" || seat.status === "LADIES")
                      .map((seat) => {
                        const selected = selectedSeats.includes(seat.seatNumber);

                        return (
                          <button
                            key={seat.seatNumber}
                            type="button"
                            aria-pressed={selected}
                            title={`${seat.seatNumber} · INR ${seat.fare.amount}${seat.genderRestriction === "LADIES" ? " · women only" : ""}`}
                            className={`h-10 rounded-md border text-sm font-semibold ${
                              selected
                                ? "border-gold-600 bg-gold-600 text-white"
                                : "border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                            }`}
                            onClick={() => toggleSeat(seat.seatNumber)}
                          >
                            {seat.seatNumber}
                          </button>
                        );
                      })}
                  </div>
                </div>
                {selectedSeats.map((seatNumber) => {
                  const passenger = passengers[seatNumber] ?? emptyPassenger;

                  return (
                    <fieldset
                      key={seatNumber}
                      className="grid gap-2 rounded-md border border-gray-200 p-3 dark:border-gray-800"
                    >
                      <legend className="px-1 text-sm font-semibold">Seat {seatNumber}</legend>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          aria-label={`Seat ${seatNumber} first name`}
                          placeholder="First name"
                          value={passenger.firstName}
                          onChange={(event) =>
                            updatePassenger(seatNumber, { firstName: event.target.value })
                          }
                        />
                        <Input
                          aria-label={`Seat ${seatNumber} last name`}
                          placeholder="Last name"
                          value={passenger.lastName}
                          onChange={(event) =>
                            updatePassenger(seatNumber, { lastName: event.target.value })
                          }
                        />
                        <Input
                          aria-label={`Seat ${seatNumber} age`}
                          placeholder="Age"
                          type="number"
                          min={1}
                          max={110}
                          value={passenger.age}
                          onChange={(event) =>
                            updatePassenger(seatNumber, { age: event.target.value })
                          }
                        />
                        <select
                          aria-label={`Seat ${seatNumber} gender`}
                          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
                          value={passenger.gender}
                          onChange={(event) =>
                            updatePassenger(seatNumber, {
                              gender: event.target.value as QuickPassenger["gender"],
                            })
                          }
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </fieldset>
                  );
                })}
              </>
            ) : null}
            <Button
              type="button"
              disabled={submitting || !customers.length}
              onClick={() => void createBooking()}
            >
              <Ticket className="h-4 w-4" aria-hidden="true" />
              Book & Email Ticket
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function PointSelect({
  label,
  onChange,
  points,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  points: SeatLayoutDetails["boardingPoints"];
  value: string;
}): React.JSX.Element {
  return (
    <label className="grid gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {label}
      <select
        className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {points.map((point) => (
          <option key={point.id} value={point.id}>
            {formatTime(point.time)} · {point.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? iso
    : new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }).format(date);
}

export function AgentCustomersWorkspace(): React.JSX.Element {
  const customerFilters = useAgentStore((state) => state.customerFilters);
  const setCustomerFilters = useAgentStore((state) => state.setCustomerFilters);
  const addRecentCustomer = useAgentStore((state) => state.addRecentCustomer);
  const [customers, setCustomers] = React.useState<AgentCustomerRecord[]>([]);
  const [status, setStatus] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<{
    name: string;
    email: string;
    phone: string;
    notes: string;
    tags: string;
    gender: "MALE" | "FEMALE" | "OTHER";
  }>({
    name: "",
    email: "",
    phone: "",
    notes: "",
    tags: "",
    gender: "OTHER",
  });

  const refresh = React.useCallback(async () => {
    const response = await listAgentCustomers({ ...customerFilters, pageSize: 50 });
    setCustomers(response.customers);
  }, [customerFilters]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addCustomer(): Promise<void> {
    // The ticket is emailed and the operator may call this number, so neither
    // is ever filled in for the agent.
    if (!draft.name.trim() || !draft.email.trim() || !draft.phone.trim()) {
      setStatus("Enter the customer's name, email, and phone.");
      return;
    }

    try {
      const customer = await createAgentCustomer({
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        gender: draft.gender,
        preferredRoutes: [],
        notes: draft.notes,
        tags: draft.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      addRecentCustomer(customer);
      setStatus(`${customer.name} added.`);
      setDraft({ name: "", email: "", phone: "", notes: "", tags: "", gender: "OTHER" });
      await refresh();
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Customer could not be added.");
    }
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
    if (
      !window.confirm(
        `Cancel ${record.booking.bookingReference}? The operator's cancellation charges apply.`,
      )
    ) {
      return;
    }

    try {
      await cancelBooking({
        bookingId: record.booking.bookingId,
        reason: "Cancelled from agent portal.",
      });
      setStatus(`${record.booking.bookingReference}: cancellation sent to the operator.`);
      await refresh();
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Cancellation failed.");
    }
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
        description="Search, sort, filter, cancel, email, and download your bookings."
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
                <option value="TICKET_GENERATED">Ticket issued</option>
                <option value="CANCELLATION_REQUESTED">Cancellation requested</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="FAILED">Failed</option>
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
            description="Use quick booking to create an agent-owned booking."
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
                <Area dataKey="revenue" stroke="#02553E" fill="#DCEDE5" strokeWidth={2} />
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
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-md bg-gold-50 text-gold-600">
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
  const user = useAuthStore((state) => state.user);

  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="Agent" title="Profile" description="Your travel agent account." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <ProfileField label="Name" value={user ? `${user.firstName} ${user.lastName}` : ""} />
          <ProfileField label="Email" value={user?.email ?? ""} />
          <ProfileField label="Phone" value={user?.phone ?? ""} />
          <Button asChild variant="outline" className="md:w-fit">
            <Link href="/profile">Edit profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AgentSettingsWorkspace(): React.JSX.Element {
  const [dashboard, setDashboard] = React.useState<AgentDashboardResponse | null>(null);

  React.useEffect(() => {
    void getAgentDashboard().then(setDashboard);
  }, []);

  const profile = dashboard?.profile;

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Agent"
        title="Settings"
        description="Your agency details. Contact the platform admin to change them."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" aria-hidden="true" />
            Agency
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <ProfileField label="Agency" value={profile?.agencyName ?? ""} />
          <ProfileField label="Contact" value={profile?.contactName ?? ""} />
          <ProfileField label="Address" value={profile?.agencyAddress ?? ""} />
          <ProfileField label="Phone" value={profile?.phone ?? ""} />
          <ProfileField label="Status" value={profile?.status.replaceAll("_", " ") ?? ""} />
          <ProfileField label="Commission" value={profile ? `${profile.commissionRate}%` : ""} />
        </CardContent>
      </Card>
    </div>
  );
}

export function AgentHelpWorkspace(): React.JSX.Element {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Agent"
        title="Help"
        description="How quick booking, customers, and reports work."
      />
      <section className="grid gap-3 md:grid-cols-2">
        {[
          [
            "Quick Booking",
            "Search a route, pick seats, enter each traveller, and the operator issues the ticket. It is emailed to the customer.",
          ],
          ["Customers", "Add the customers you book for. Each agent sees only their own."],
          ["Reports", "Your bookings by day, week, and month. Export tables as CSV."],
          [
            "Real tickets",
            "Every booking is a real ticket from the bus operator. Cancellation charges follow the operator's policy.",
          ],
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

function ProfileField({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <p className="text-xs uppercase tracking-normal text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-medium text-gray-950 dark:text-gray-50">{value || "—"}</p>
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
