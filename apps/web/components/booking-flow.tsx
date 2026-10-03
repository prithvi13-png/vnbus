"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Armchair, CheckCircle2, Download, Mail, RefreshCw, Ticket, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type {
  BoardingDroppingPoint,
  BookingRecord,
  SeatDeckLayout,
  SeatLayoutDetails,
  SeatMapSeat,
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
  EmptyState,
  Input,
  Skeleton,
  StatusChip,
  Tag,
  Timeline,
  cn,
} from "@vnbus/ui";
import { summarizeSeatFare } from "@vnbus/shared";

import { useAuthStore } from "../lib/auth-store";

import {
  cancelBooking,
  createBooking,
  downloadTicketPdf,
  emailTicket,
  getBooking,
  getBookingTimeline,
  getTicket,
  getSeatLayout,
} from "../lib/api-client";
import { useBookingStore } from "../lib/booking-store";
import { InvoiceDownloadButton } from "./invoice-download-button";

const passengerSchema = z.object({
  passengers: z.array(
    z.object({
      seatNumber: z.string().min(1),
      firstName: z.string().min(2, "First name is required"),
      lastName: z.string().min(2, "Last name is required"),
      age: z
        .number({ message: "Enter a valid age" })
        .int("Enter a valid age")
        .min(1, "Enter a valid age")
        .max(110, "Enter a valid age"),
      gender: z.enum(["MALE", "FEMALE", "OTHER"], {
        message: "Select gender",
      }),
      phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
      email: z.string().email("Enter a valid email"),
      emergencyContact: z
        .string()
        .regex(/^\+?[0-9]{10,15}$/, "Enter a valid emergency contact")
        .optional()
        .or(z.literal("")),
    }),
  ),
});

type PassengerFormValues = z.infer<typeof passengerSchema>;

type BookingStepId = "search" | "seats" | "details" | "review" | "ticket";

const bookingSteps: Array<{ id: BookingStepId; label: string }> = [
  { id: "search", label: "Search" },
  { id: "seats", label: "Seats" },
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
  { id: "ticket", label: "Ticket" },
];

export function SeatSelectionFlow(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams?.get("tripId") ?? "";
  const journeyDate = searchParams?.get("date") ?? "";
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const setLayout = useBookingStore((state) => state.setLayout);
  const toggleSeat = useBookingStore((state) => state.toggleSeat);
  const boardingPoint = useBookingStore((state) => state.boardingPoint);
  const droppingPoint = useBookingStore((state) => state.droppingPoint);
  const setBoardingPoint = useBookingStore((state) => state.setBoardingPoint);
  const setDroppingPoint = useBookingStore((state) => state.setDroppingPoint);
  const [error, setError] = React.useState<string | null>(null);
  const query = useQuery({
    queryKey: ["seat-layout", tripId, journeyDate],
    queryFn: () => getSeatLayout(tripId, journeyDate),
    enabled: Boolean(tripId && journeyDate),
    retry: false,
  });

  React.useEffect(() => {
    if (query.data) {
      setLayout(query.data);
    }
  }, [query.data, setLayout]);

  const activeLayout = query.data ?? null;
  const selectedSeatModels = React.useMemo(
    () => getSelectedSeatModels(activeLayout, selectedSeats),
    [activeLayout, selectedSeats],
  );
  const selectedFare = summarizeSeatFare(selectedSeatModels).grandTotal.amount;
  const canContinue = selectedSeatModels.length > 0 && Boolean(boardingPoint && droppingPoint);

  React.useEffect(() => {
    if (!activeLayout) {
      return;
    }

    if (
      !boardingPoint ||
      !activeLayout.boardingPoints.some((point) => point.id === boardingPoint.id)
    ) {
      const firstBoardingPoint = activeLayout.boardingPoints[0];
      if (firstBoardingPoint) {
        setBoardingPoint(firstBoardingPoint);
      }
    }

    if (
      !droppingPoint ||
      !activeLayout.droppingPoints.some((point) => point.id === droppingPoint.id)
    ) {
      const firstDroppingPoint = activeLayout.droppingPoints[0];
      if (firstDroppingPoint) {
        setDroppingPoint(firstDroppingPoint);
      }
    }
  }, [activeLayout, boardingPoint, droppingPoint, setBoardingPoint, setDroppingPoint]);

  function continueToPassengers(): void {
    if (!activeLayout || !boardingPoint || !droppingPoint || !selectedSeatModels.length) {
      setError("Select a seat to continue");

      return;
    }

    setError(null);
    // Booking requires an account. Send anyone signed out to login first and
    // bring them back here, rather than letting them fill in passenger
    // details and hit a 401 at the end.
    if (!useAuthStore.getState().accessToken) {
      router.push(`/login?redirect=${encodeURIComponent("/passenger-details")}`);
      return;
    }
    router.push("/passenger-details");
  }

  if (!tripId || !journeyDate) {
    return (
      <EmptyState
        title="Choose a bus first"
        description="Search for buses and pick one to see its seats."
        actionLabel="Search buses"
        onAction={() => router.push("/search")}
      />
    );
  }

  if (query.isError) {
    return (
      <EmptyState
        title="Seats are not available"
        description={
          query.error instanceof Error ? query.error.message : "The seat map could not be loaded."
        }
        actionLabel="Search again"
        onAction={() => router.push("/search")}
      />
    );
  }

  if (query.isLoading || !activeLayout) {
    return <BookingSkeleton />;
  }

  return (
    <div className="grid gap-6 pb-24 lg:pb-0">
      <BookingStepHeader
        activeStep="seats"
        description="Pick your seats. The first boarding and dropping points are selected for you."
        layout={activeLayout}
        title="Choose seats and points"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-5">
          {error ? (
            <Alert variant="danger">
              <AlertTitle>Seat selection</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Card className="overflow-hidden">
            <CardHeader className="gap-3 border-b border-gold-100 dark:border-brand-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Select seats</CardTitle>
                  <CardDescription>
                    {activeLayout.operatorName} · {activeLayout.busType}
                  </CardDescription>
                </div>
                <SeatLegend />
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 p-4 sm:p-5">
              {[...activeLayout.decks].sort(compareSeatDecks).map((deck) => (
                <SeatDeckPanel
                  key={deck.deck}
                  deck={deck}
                  maxSelectableSeats={activeLayout.maxSelectableSeats}
                  selectedSeats={selectedSeats}
                  onToggle={toggleSeat}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Boarding and dropping</CardTitle>
              <CardDescription>Change the point only if you need a different stop.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-2">
              <PointPicker
                title="Boarding"
                points={activeLayout.boardingPoints}
                selectedId={boardingPoint?.id}
                onSelect={setBoardingPoint}
              />
              <PointPicker
                title="Dropping"
                points={activeLayout.droppingPoints}
                selectedId={droppingPoint?.id}
                onSelect={setDroppingPoint}
              />
            </CardContent>
          </Card>
        </section>

        <aside className="hidden h-max rounded-lg border border-gold-100 bg-white/95 p-5 shadow-premium dark:border-brand-800 dark:bg-brand-950/90 lg:sticky lg:top-24 lg:block">
          <h2 className="text-lg font-semibold text-brand-950 dark:text-white">Your ticket</h2>
          <div className="mt-4 rounded-lg border border-gold-100 bg-pearl-50 p-3 text-sm text-brand-950 dark:border-brand-800 dark:bg-white/5 dark:text-brand-50">
            <p className="font-semibold">
              {activeLayout.sourceCity} to {activeLayout.destinationCity}
            </p>
            <p className="mt-1 text-xs text-brand-700 dark:text-brand-100">
              {formatTime(activeLayout.departureTime)} ·{" "}
              {formatDuration(activeLayout.durationMinutes)}
            </p>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <SummaryRow label="Seats" value={selectedSeats.join(", ") || "Select seat"} />
            <SummaryRow label="Boarding" value={boardingPoint?.name ?? "Select a point"} />
            <SummaryRow label="Dropping" value={droppingPoint?.name ?? "Select a point"} />
            <SummaryRow label="Fare" value={formatInr(selectedFare)} />
          </div>
          <Button
            type="button"
            className="mt-4 w-full"
            disabled={!canContinue}
            onClick={continueToPassengers}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Continue
          </Button>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold-100 bg-white/95 p-3 shadow-premium backdrop-blur-xl dark:border-brand-800 dark:bg-brand-950/95 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0 text-sm">
            <p className="truncate font-semibold text-brand-900 dark:text-white">
              {selectedSeats.length ? `Seat ${selectedSeats.join(", ")}` : "Select a seat"}
            </p>
            <p className="truncate text-xs text-gray-600 dark:text-gray-400">
              {formatInr(selectedFare)} · {boardingPoint?.name ?? "Select boarding point"}
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0"
            disabled={!canContinue}
            onClick={continueToPassengers}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PassengerDetailsFlow(): React.JSX.Element {
  const router = useRouter();
  const layout = useBookingStore((state) => state.layout);
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const passengers = useBookingStore((state) => state.passengers);
  const setPassengers = useBookingStore((state) => state.setPassengers);
  const form = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      passengers: selectedSeats.map((seatNumber, index) => ({
        seatNumber,
        firstName: passengers[index]?.firstName ?? "",
        lastName: passengers[index]?.lastName ?? "",
        // Blank, not a guess. A prefilled age rides onto the ticket as fact.
        age: passengers[index]?.age ?? Number.NaN,
        gender: passengers[index]?.gender ?? "MALE",
        // These were prefilled with "+919876543210" and "traveller@example.com",
        // which pass validation — so a traveller could accept the defaults and
        // have their ticket delivered to a placeholder address that is not
        // theirs. Contact details must be typed by the person booking.
        phone: passengers[index]?.phone ?? "",
        email: passengers[index]?.email ?? "",
        emergencyContact: passengers[index]?.emergencyContact ?? "",
      })),
    },
  });

  if (!layout || !selectedSeats.length) {
    return (
      <EmptyState
        title="No seats selected"
        description="Start from seat selection to continue the booking flow."
        actionLabel="Select seats"
        onAction={() => router.push("/seat-layout")}
      />
    );
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        void form.handleSubmit((values: PassengerFormValues) => {
          setPassengers(
            values.passengers.map((passenger) => {
              const { emergencyContact, ...requiredPassenger } = passenger;

              return emergencyContact
                ? { ...requiredPassenger, emergencyContact }
                : requiredPassenger;
            }),
          );
          router.push("/booking-review");
        })(event);
      }}
    >
      <BookingStepHeader
        activeStep="details"
        description={`${selectedSeats.length} seat${selectedSeats.length === 1 ? "" : "s"} selected. Add traveller details to continue.`}
        layout={layout}
        title="Passenger Details"
      />

      <div className="grid gap-4">
        {selectedSeats.map((seatNumber, index) => (
          <Card key={seatNumber}>
            <CardHeader className="border-b border-gold-100 py-4 dark:border-brand-900">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">Seat {seatNumber}</CardTitle>
                <Badge variant="neutral">Traveller {index + 1}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label="First Name"
                error={form.formState.errors.passengers?.[index]?.firstName?.message}
              >
                <Input {...form.register(`passengers.${index}.firstName`)} />
              </Field>
              <Field
                label="Last Name"
                error={form.formState.errors.passengers?.[index]?.lastName?.message}
              >
                <Input {...form.register(`passengers.${index}.lastName`)} />
              </Field>
              <Field label="Age" error={form.formState.errors.passengers?.[index]?.age?.message}>
                <Input
                  type="number"
                  {...form.register(`passengers.${index}.age`, { valueAsNumber: true })}
                />
              </Field>
              <Field
                label="Gender"
                error={form.formState.errors.passengers?.[index]?.gender?.message}
              >
                <select
                  className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
                  {...form.register(`passengers.${index}.gender`)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
              <Field
                label="Phone"
                error={form.formState.errors.passengers?.[index]?.phone?.message}
              >
                <Input {...form.register(`passengers.${index}.phone`)} />
              </Field>
              <Field
                label="Email"
                error={form.formState.errors.passengers?.[index]?.email?.message}
              >
                <Input type="email" {...form.register(`passengers.${index}.email`)} />
              </Field>
              <Field
                label="Emergency Contact"
                error={form.formState.errors.passengers?.[index]?.emergencyContact?.message}
              >
                <Input {...form.register(`passengers.${index}.emergencyContact`)} />
              </Field>
              <input
                type="hidden"
                {...form.register(`passengers.${index}.seatNumber`)}
                value={seatNumber}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap justify-between gap-3 rounded-lg border border-gold-100 bg-white p-3 shadow-sm dark:border-brand-900 dark:bg-brand-950">
        <Button asChild variant="outline">
          <Link href="/seat-layout">Back to seats</Link>
        </Button>
        <Button type="submit">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Review booking
        </Button>
      </div>
    </form>
  );
}

export function BookingReviewFlow(): React.JSX.Element {
  const router = useRouter();
  const layout = useBookingStore((state) => state.layout);
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const boardingPoint = useBookingStore((state) => state.boardingPoint);
  const droppingPoint = useBookingStore((state) => state.droppingPoint);
  const passengers = useBookingStore((state) => state.passengers);
  const setConfirmation = useBookingStore((state) => state.setConfirmation);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const fare = summarizeSeatFare(getSelectedSeatModels(layout, selectedSeats));

  async function confirm(): Promise<void> {
    if (!layout || !boardingPoint || !droppingPoint || !passengers.length) {
      setError("Your booking details are incomplete. Select your seats again.");

      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const confirmation = await createBooking({
        supplierCode: layout.supplierCode,
        tripId: layout.tripId,
        journeyDate: layout.journeyDate,
        selectedSeats,
        boardingPointId: boardingPoint.id,
        droppingPointId: droppingPoint.id,
        passengers,
      });
      setConfirmation(confirmation);
      router.push(`/booking-confirmation?bookingId=${confirmation.booking.bookingId}`);
    } catch (caught) {
      // The operator's reason (a seat sold, a search expired) is worth
      // showing here; the traveller can act on it without leaving the page.
      setError(caught instanceof Error ? caught.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!layout || !selectedSeats.length || !passengers.length) {
    return (
      <EmptyState
        title="Nothing to review"
        description="Select your seats and add traveller details first."
        actionLabel="Search buses"
        onAction={() => router.push("/search")}
      />
    );
  }

  return (
    <div className="grid gap-6">
      <BookingStepHeader
        activeStep="review"
        description="Check the trip, passenger names, and fare before confirming."
        layout={layout}
        title="Booking Review"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="grid gap-5">
          {error ? (
            <Alert variant="danger">
              <AlertTitle>Booking failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Trip and seats</CardTitle>
              <CardDescription>
                {layout.sourceCity} to {layout.destinationCity} · {layout.journeyDate}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <SummaryTile label="Seats" value={selectedSeats.join(", ")} />
              <SummaryTile label="Passengers" value={`${passengers.length}`} />
              <SummaryTile
                label="Boarding"
                value={
                  boardingPoint ? `${formatTime(boardingPoint.time)} · ${boardingPoint.name}` : ""
                }
              />
              <SummaryTile
                label="Dropping"
                value={
                  droppingPoint ? `${formatTime(droppingPoint.time)} · ${droppingPoint.name}` : ""
                }
              />
              <SummaryTile label="Operator" value={layout.operatorName} />
              <SummaryTile label="Bus Type" value={layout.busType} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Passengers</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {passengers.map((passenger) => (
                <div
                  key={passenger.seatNumber}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gold-100 bg-white p-3 dark:border-brand-900 dark:bg-brand-950"
                >
                  <span className="font-medium text-gray-950 dark:text-gray-50">
                    {passenger.firstName} {passenger.lastName}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Seat {passenger.seatNumber} · {passenger.gender} · {passenger.age}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Before you confirm</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <SummaryTile
                label="Ticket"
                value="Issued by the operator as soon as you confirm, and emailed to the first passenger."
              />
              <SummaryTile
                label="Cancellation"
                value="Charges follow the operator's cancellation policy for this bus."
              />
            </CardContent>
          </Card>
        </section>

        <aside className="h-max rounded-lg border border-gold-100 bg-white p-5 shadow-sm dark:border-brand-900 dark:bg-brand-950 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-brand-900 dark:text-white">Fare Summary</h2>
          <FareSummary fare={fare} />
          <Button
            type="button"
            className="mt-5 w-full"
            disabled={submitting}
            onClick={() => void confirm()}
          >
            {submitting ? (
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Ticket className="h-4 w-4" aria-hidden="true" />
            )}
            Confirm Booking
          </Button>
        </aside>
      </div>
    </div>
  );
}

export function BookingSuccessFlow(): React.JSX.Element {
  const booking = useBookingStore((state) => state.booking);
  const ticket = useBookingStore((state) => state.ticket);

  if (!booking || !ticket) {
    return (
      <EmptyState
        title="No confirmed booking"
        description="Complete a booking to view confirmation."
        actionLabel="Search buses"
        onAction={() => {
          window.location.href = "/search";
        }}
      />
    );
  }

  return (
    <Card>
      <CardContent className="grid gap-4 p-6">
        <StatusChip tone="success">Booking Confirmed</StatusChip>
        <h2 className="text-2xl font-semibold text-gray-950 dark:text-gray-50">
          {booking.bookingReference}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryTile label="PNR" value={ticket.pnr} />
          <SummaryTile label="Ticket" value={ticket.ticketNumber} />
          <SummaryTile
            label="Route"
            value={`${booking.trip.sourceCity} to ${booking.trip.destinationCity}`}
          />
          <SummaryTile label="Seats" value={booking.selectedSeats.join(", ")} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/ticket?bookingId=${booking.bookingId}`}>
              <Ticket className="h-4 w-4" aria-hidden="true" />
              View ticket
            </Link>
          </Button>
          <InvoiceDownloadButton booking={booking} />
          <Button asChild variant="outline">
            <Link href={`/booking-history/${booking.bookingId}`}>Booking details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingFailedFlow(): React.JSX.Element {
  const layout = useBookingStore((state) => state.layout);

  return (
    <EmptyState
      title="Booking failed"
      description="The reservation could not be confirmed. Retry the booking or select seats again."
      actionLabel="Retry booking"
      onAction={() => {
        window.location.href = layout
          ? `/seat-layout?tripId=${layout.tripId}&date=${layout.journeyDate}`
          : "/search";
      }}
    />
  );
}

export function TicketViewFlow(): React.JSX.Element {
  const searchParams = useSearchParams();
  const activeBooking = useBookingStore((state) => state.booking);
  const bookingId = searchParams?.get("bookingId") ?? activeBooking?.bookingId ?? "";
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const bookingQuery = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: Boolean(bookingId),
    retry: false,
  });
  const ticketQuery = useQuery({
    queryKey: ["ticket", bookingId],
    queryFn: () => getTicket(bookingId),
    enabled: Boolean(bookingId),
    retry: false,
  });
  const booking = bookingQuery.data;
  const ticket = ticketQuery.data;

  if (bookingQuery.isLoading || ticketQuery.isLoading) {
    return <BookingSkeleton />;
  }

  if (!booking || !ticket) {
    return (
      <EmptyState
        title="Ticket not available"
        description={
          ticketQuery.error instanceof Error
            ? ticketQuery.error.message
            : "Confirm a booking to generate a ticket."
        }
        actionLabel="Search buses"
        onAction={() => {
          window.location.href = "/search";
        }}
      />
    );
  }

  async function download(): Promise<void> {
    if (!booking) {
      return;
    }
    try {
      setDownloading(true);
      setError(null);
      const pdf = await downloadTicketPdf(booking);
      const link = document.createElement("a");
      link.href = `data:${pdf.mimeType};base64,${pdf.base64}`;
      link.download = pdf.fileName;
      link.click();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card>
      <CardContent className="grid gap-4 p-6">
        <div>
          <Badge>Vriddhi Nexus Pvt Ltd</Badge>
          <h2 className="mt-3 text-2xl font-semibold text-gray-950 dark:text-gray-50">
            {ticket.ticketNumber}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">PNR {ticket.pnr}</p>
        </div>
        {error ? (
          <Alert variant="danger">
            <AlertTitle>Download failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryTile
            label="Passenger"
            value={booking.passengers
              .map((passenger) => `${passenger.firstName} ${passenger.lastName}`)
              .join(", ")}
          />
          <SummaryTile label="Seats" value={booking.selectedSeats.join(", ")} />
          <SummaryTile
            label="Route"
            value={`${booking.trip.sourceCity} to ${booking.trip.destinationCity}`}
          />
          <SummaryTile label="Operator" value={booking.trip.operatorName} />
          <SummaryTile label="Bus Type" value={booking.trip.busType} />
          <SummaryTile
            label="Boarding"
            value={`${formatDateTime(booking.boardingPoint.time)} · ${booking.boardingPoint.name}`}
          />
          <SummaryTile
            label="Dropping"
            value={`${formatDateTime(booking.droppingPoint.time)} · ${booking.droppingPoint.name}`}
          />
          <SummaryTile
            label="Emergency Contact"
            value={booking.passengers[0]?.emergencyContact ?? "Not provided"}
          />
          <SummaryTile label="Support" value={ticket.supportContact.email} />
        </div>
        <StatusChip tone="info">Live Tracking Coming Soon</StatusChip>
        <div>
          <h3 className="text-sm font-semibold text-gray-950 dark:text-gray-50">Terms</h3>
          <ul className="mt-2 grid gap-1 text-sm text-gray-600 dark:text-gray-400">
            {ticket.terms.map((term) => (
              <li key={term}>- {term}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="w-fit"
            variant="outline"
            onClick={() => void download()}
            disabled={downloading}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Ticket
          </Button>
          <InvoiceDownloadButton booking={booking} size="default" />
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingHistoryDetailFlow(): React.JSX.Element {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params?.bookingId ?? "";
  const query = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: Boolean(bookingId),
    retry: false,
  });

  if (query.isLoading) {
    return <BookingSkeleton />;
  }

  if (!query.data) {
    return (
      <EmptyState
        title="Booking not found"
        description="This booking does not exist or belongs to another account."
        actionLabel="View booking history"
        onAction={() => {
          window.location.href = "/booking-history";
        }}
      />
    );
  }

  return <BookingDetails booking={query.data} />;
}

function BookingStepHeader({
  activeStep,
  description,
  layout,
  meta,
  title,
}: {
  activeStep: BookingStepId;
  description: string;
  layout?: SeatLayoutDetails;
  meta?: React.ReactNode;
  title: string;
}): React.JSX.Element {
  const activeIndex = bookingSteps.findIndex((step) => step.id === activeStep);

  return (
    <section className="grid gap-3">
      <div className="flex flex-col gap-4 rounded-lg border border-gold-100 bg-white p-4 shadow-sm dark:border-brand-900 dark:bg-brand-950 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-gold-600 dark:text-gold-100">
            Book ticket
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-brand-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
            {description}
          </p>
          {layout ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Tag>
                {layout.sourceCity} to {layout.destinationCity}
              </Tag>
              <Tag>{layout.journeyDate}</Tag>
              <Tag>
                {formatTime(layout.departureTime)} · {formatDuration(layout.durationMinutes)}
              </Tag>
            </div>
          ) : null}
        </div>
        {meta ? <div className="shrink-0">{meta}</div> : null}
      </div>
      <ol className="grid grid-cols-5 gap-2 rounded-lg border border-gold-100 bg-white p-2 shadow-sm dark:border-brand-900 dark:bg-brand-950">
        {bookingSteps.map((step, index) => {
          const active = step.id === activeStep;
          const complete = index < activeIndex;

          return (
            <li
              key={step.id}
              className={cn(
                "rounded-md px-2 py-2 text-center text-xs font-semibold transition",
                active
                  ? "bg-brand-700 text-white"
                  : complete
                    ? "bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-100"
                    : "bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400",
              )}
            >
              {step.label}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function SeatLegend(): React.JSX.Element {
  const items: Array<{
    label: string;
    tone: SeatVisualTone;
  }> = [
    { label: "Available", tone: "available" },
    { label: "For Female", tone: "female" },
    { label: "For Male", tone: "male" },
    { label: "Female Booked", tone: "femaleBooked" },
    { label: "Booked", tone: "booked" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.tone}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
        >
          <SeatLegendIcon tone={item.tone} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

type SeatVisualTone =
  "available" | "selected" | "female" | "male" | "femaleBooked" | "booked" | "blocked";

function compareSeatDecks(left: SeatDeckLayout, right: SeatDeckLayout): number {
  const order: Record<SeatDeckLayout["deck"], number> = {
    UPPER: 0,
    LOWER: 1,
  };

  return order[left.deck] - order[right.deck];
}

function SeatDeckPanel({
  deck,
  maxSelectableSeats,
  onToggle,
  selectedSeats,
}: {
  deck: SeatDeckLayout;
  maxSelectableSeats: number;
  onToggle: (seatNumber: string, maxSeats: number) => void;
  selectedSeats: string[];
}): React.JSX.Element {
  const gridRows = deck.seats.some((seat) => seat.kind === "SLEEPER")
    ? "4.5rem 4.5rem 2.75rem 4.5rem"
    : `repeat(${deck.columns}, 4rem)`;

  return (
    <section className="overflow-hidden rounded-lg border border-gold-100 bg-white/90 shadow-sm dark:border-brand-800 dark:bg-brand-950/50">
      <div className="grid min-h-[220px] grid-cols-[64px_minmax(0,1fr)] sm:grid-cols-[82px_minmax(0,1fr)]">
        <div className="flex items-center justify-center border-r border-gold-100 bg-pearl-50 dark:border-brand-800 dark:bg-brand-900/70">
          <p className="-rotate-90 text-xl font-semibold tracking-normal text-brand-950 dark:text-white">
            {deck.deck === "UPPER" ? "Upper" : "Lower"}
          </p>
        </div>
        <div className="overflow-x-auto p-4 sm:p-5">
          <div
            className="grid min-w-[640px] gap-3"
            style={{
              gridTemplateColumns: `repeat(${deck.rows}, minmax(92px, 1fr))`,
              gridTemplateRows: gridRows,
            }}
          >
            {deck.deck === "LOWER" ? (
              <div
                className="flex items-center justify-center rounded-full border-4 border-gray-400 bg-white text-gray-500 shadow-sm dark:bg-brand-950"
                style={{
                  gridColumn: "1",
                  gridRow: "1 / span 2",
                }}
                aria-hidden="true"
              >
                <Armchair className="h-7 w-7" />
              </div>
            ) : null}
            {deck.seats.map((seat) => (
              <SeatBerthButton
                key={seat.seatNumber}
                maxSelectableSeats={maxSelectableSeats}
                onToggle={onToggle}
                seat={seat}
                selected={selectedSeats.includes(seat.seatNumber)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SeatBerthButton({
  maxSelectableSeats,
  onToggle,
  seat,
  selected,
}: {
  maxSelectableSeats: number;
  onToggle: (seatNumber: string, maxSeats: number) => void;
  seat: SeatMapSeat;
  selected: boolean;
}): React.JSX.Element {
  const selectable = isSeatSelectable(seat);
  const tone = selected ? "selected" : getSeatVisualTone(seat);
  const showPrice = selectable || selected;

  return (
    <button
      type="button"
      disabled={!selectable}
      title={seatTooltip(seat)}
      aria-label={seatTooltip(seat)}
      aria-pressed={selected}
      onClick={() => onToggle(seat.seatNumber, maxSelectableSeats)}
      className={cn(
        "relative flex h-full min-h-16 items-center justify-center rounded-md border-2 px-3 text-sm font-semibold tracking-normal transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
        seatToneClassName(tone),
      )}
      style={{
        gridColumn: seat.row,
        gridRow: seatGridRow(seat),
      }}
    >
      {showPrice ? <span>{formatMoney(seat.fare.amount)}</span> : null}
      <span
        className={cn(
          "absolute right-0 top-2 h-[calc(100%-1rem)] w-1.5 rounded-l-full",
          seatStripClassName(tone),
        )}
        aria-hidden="true"
      />
    </button>
  );
}

function SeatLegendIcon({ tone }: { tone: SeatVisualTone }): React.JSX.Element {
  return (
    <span
      className={cn(
        "relative h-7 w-7 rounded-md border-2 bg-white",
        seatToneClassName(tone),
        tone === "booked" || tone === "femaleBooked" ? "bg-gray-200" : "",
      )}
      aria-hidden="true"
    >
      <span
        className={cn("absolute right-0 top-1 h-5 w-1 rounded-l-full", seatStripClassName(tone))}
      />
    </span>
  );
}

function getSeatVisualTone(seat: SeatMapSeat): SeatVisualTone {
  if (seat.status === "BOOKED" && seat.genderRestriction === "LADIES") {
    return "femaleBooked";
  }

  if (seat.status === "BOOKED") {
    return "booked";
  }

  if (seat.status === "BLOCKED" || seat.status === "RESERVED") {
    return "blocked";
  }

  if (seat.genderRestriction === "MALE") {
    return "male";
  }

  if (seat.status === "LADIES" || seat.genderRestriction === "LADIES") {
    return "female";
  }

  return "available";
}

function seatGridRow(seat: SeatMapSeat): string {
  if (seat.kind !== "SLEEPER") {
    return String(seat.column);
  }

  if (seat.column === 1) {
    return "1";
  }

  if (seat.column === 2) {
    return "2";
  }

  return "4";
}

function seatToneClassName(tone: SeatVisualTone): string {
  return {
    available:
      "border-gray-300 bg-white text-brand-950 shadow-sm hover:border-gold-500 hover:bg-gold-50 hover:shadow-panel dark:bg-brand-950 dark:text-white",
    selected:
      "border-brand-700 bg-brand-100 text-brand-950 shadow-[0_10px_24px_rgba(2,85,62,0.18)] hover:bg-brand-100 dark:bg-brand-900 dark:text-white",
    female:
      "border-pink-500 bg-white text-brand-950 shadow-sm hover:bg-pink-50 hover:shadow-panel dark:bg-brand-950 dark:text-white",
    male: "border-blue-500 bg-white text-brand-950 shadow-sm hover:bg-blue-50 hover:shadow-panel dark:bg-brand-950 dark:text-white",
    femaleBooked: "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400",
    booked: "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400",
    blocked: "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400",
  }[tone];
}

function seatStripClassName(tone: SeatVisualTone): string {
  return {
    available: "bg-gray-400",
    selected: "bg-brand-700",
    female: "bg-pink-500",
    male: "bg-blue-500",
    femaleBooked: "bg-pink-500",
    booked: "bg-gray-500",
    blocked: "bg-gray-400",
  }[tone];
}

function formatMoney(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function PointPicker({
  onSelect,
  points,
  selectedId,
  title,
}: {
  onSelect: (point: BoardingDroppingPoint) => void;
  points: BoardingDroppingPoint[];
  selectedId: string | undefined;
  title: string;
}): React.JSX.Element {
  return (
    <section className="grid gap-3">
      <h3 className="text-sm font-semibold text-brand-950 dark:text-white">{title}</h3>
      <div className="grid gap-2">
        {points.map((point) => (
          <button
            key={point.id}
            type="button"
            onClick={() => onSelect(point)}
            className={cn(
              "rounded-md border p-3 text-left text-sm shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
              selectedId === point.id
                ? "border-gold-500 bg-gold-50 dark:bg-gold-500/10"
                : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-gold-200 hover:bg-pearl-50 dark:border-brand-800 dark:bg-brand-950",
            )}
          >
            <span className="flex justify-between gap-3">
              <span className="font-semibold text-brand-950 dark:text-gray-50">{point.name}</span>
              <span className="text-gray-600 dark:text-gray-400">{formatTime(point.time)}</span>
            </span>
            <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
              {[point.address, point.landmark].filter(Boolean).join(" · ")}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error: string | undefined;
  label: string;
}): React.JSX.Element {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-normal text-brand-800 dark:text-brand-100">
        {label}
      </span>
      {children}
      <span className="min-h-4 text-xs text-red-600 dark:text-red-300">{error}</span>
    </label>
  );
}

function BookingDetails({ booking: initial }: { booking: BookingRecord }): React.JSX.Element {
  const [booking, setBooking] = React.useState(initial);
  const [working, setWorking] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const ticketable = ["CONFIRMED", "TICKET_GENERATED"].includes(booking.status);
  const cancellable = ticketable && Date.parse(booking.trip.departureTime) > Date.now();
  const ticketQuery = useQuery({
    queryKey: ["ticket", booking.bookingId],
    queryFn: () => getTicket(booking.bookingId),
    enabled: ticketable,
    retry: false,
  });
  const timelineQuery = useQuery({
    queryKey: ["booking-timeline", booking.bookingId, booking.status],
    queryFn: () => getBookingTimeline(booking.bookingId),
    retry: false,
  });
  const ticket = ticketQuery.data;

  async function download(): Promise<void> {
    try {
      setWorking("download");
      setError(null);
      const pdf = await downloadTicketPdf(booking);
      const link = document.createElement("a");
      link.href = `data:${pdf.mimeType};base64,${pdf.base64}`;
      link.download = pdf.fileName;
      link.click();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Download failed");
    } finally {
      setWorking(null);
    }
  }

  async function sendEmailAgain(): Promise<void> {
    try {
      setWorking("email");
      setError(null);
      const response = await emailTicket({ bookingId: booking.bookingId });
      setNotice(`Ticket email ${response.status.toLowerCase()}.`);
      void timelineQuery.refetch();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Email failed");
    } finally {
      setWorking(null);
    }
  }

  async function requestCancellation(): Promise<void> {
    if (
      !window.confirm(
        `Cancel ${booking.bookingReference}? The operator's cancellation charges apply.`,
      )
    ) {
      return;
    }

    try {
      setWorking("cancel");
      setError(null);
      const response = await cancelBooking({
        bookingId: booking.bookingId,
        reason: "Cancelled from booking details",
      });
      setBooking(response.booking);
      setNotice("The operator is processing your cancellation. Your refund is pending.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Cancellation failed");
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>{booking.bookingReference}</CardTitle>
            <CardDescription>
              {booking.trip.operatorName} · {booking.trip.busType}
            </CardDescription>
          </div>
          <StatusChip tone={statusToneForBooking(booking.status)}>
            {booking.status.replaceAll("_", " ")}
          </StatusChip>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryTile
            label="Route"
            value={`${booking.trip.sourceCity} to ${booking.trip.destinationCity}`}
          />
          <SummaryTile label="Seats" value={booking.selectedSeats.join(", ")} />
          <SummaryTile label="PNR" value={booking.pnr ?? "Not issued"} />
          <SummaryTile label="Total" value={formatInr(booking.fare.grandTotal.amount)} />
        </CardContent>
      </Card>
      {error ? (
        <Alert variant="danger">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {notice ? (
        <Alert>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      {ticketable ? (
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <SummaryTile
              label="Ticket Number"
              value={ticket?.ticketNumber ?? booking.ticketNumber ?? ""}
            />
            <SummaryTile label="Support" value={ticket?.supportContact.email ?? ""} />
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button
                type="button"
                onClick={() => void download()}
                loading={working === "download"}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PDF
              </Button>
              <InvoiceDownloadButton booking={booking} size="default" />
              <Button
                type="button"
                variant="outline"
                onClick={() => void sendEmailAgain()}
                loading={working === "email"}
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email Ticket Again
              </Button>
              <Button asChild variant="outline">
                <Link href={`/ticket?bookingId=${booking.bookingId}`}>
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                  Ticket Viewer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Passengers</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {booking.passengers.map((passenger) => (
              <SummaryRow
                key={passenger.seatNumber}
                label={`${passenger.firstName} ${passenger.lastName}`}
                value={`Seat ${passenger.seatNumber} · ${passenger.gender} · ${passenger.age}`}
              />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fare Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <FareSummary fare={booking.fare} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Booking Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline
            items={(timelineQuery.data ?? []).map((event) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              timestamp: formatDateTime(event.occurredAt),
              tone: event.tone,
            }))}
          />
        </CardContent>
      </Card>
      {cancellable ? (
        <Card>
          <CardHeader>
            <CardTitle>Cancel Booking</CardTitle>
            <CardDescription>
              The operator&apos;s cancellation charges apply. Your refund follows once the operator
              settles the cancellation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="destructive"
              loading={working === "cancel"}
              onClick={() => void requestCancellation()}
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Cancel Booking
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function FareSummary({ fare }: { fare: NonNullable<BookingRecord["fare"]> }): React.JSX.Element {
  return (
    <div className="mt-4 grid gap-3 text-sm">
      <SummaryRow label="Base Fare" value={formatInr(fare.baseFare.amount)} />
      <SummaryRow label="GST" value={formatInr(fare.taxes.amount)} />
      {fare.discount.amount > 0 ? (
        <SummaryRow label="Discount" value={`- ${formatInr(fare.discount.amount)}`} />
      ) : null}
      {fare.convenienceFee.amount > 0 ? (
        <SummaryRow label="Convenience Fee" value={formatInr(fare.convenienceFee.amount)} />
      ) : null}
      <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
        <SummaryRow label="Grand Total" value={formatInr(fare.grandTotal.amount)} />
      </div>
    </div>
  );
}

function statusToneForBooking(
  status: BookingRecord["status"],
): "neutral" | "success" | "warning" | "danger" | "info" {
  if (status === "CONFIRMED" || status === "TICKET_GENERATED") {
    return "success";
  }
  if (status === "PENDING_PAYMENT" || status === "SEAT_HELD" || status === "REFUND_PENDING") {
    return "warning";
  }
  if (status === "CANCELLED" || status === "FAILED" || status === "EXPIRED") {
    return "danger";
  }
  if (status === "RESCHEDULED" || status === "CANCELLATION_REQUESTED") {
    return "info";
  }

  return "neutral";
}

function SummaryRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-right font-medium text-gray-950 dark:text-gray-50">{value}</span>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs uppercase tracking-normal text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-semibold text-gray-950 dark:text-gray-50">{value}</p>
    </div>
  );
}

function BookingSkeleton(): React.JSX.Element {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

function getSelectedSeatModels(
  layout: SeatLayoutDetails | null,
  selectedSeats: string[],
): SeatMapSeat[] {
  if (!layout) {
    return [];
  }
  const selected = new Set(selectedSeats);

  return layout.decks.flatMap((deck) => deck.seats).filter((seat) => selected.has(seat.seatNumber));
}

function isSeatSelectable(seat: SeatMapSeat): boolean {
  return seat.status === "AVAILABLE" || seat.status === "LADIES";
}

function seatTooltip(seat: SeatMapSeat): string {
  const flags = [
    seat.kind,
    seat.isWindow ? "Window" : "Aisle",
    seat.hasExtraLegroom ? "Extra legroom" : "",
    seat.isEmergencyExit ? "Emergency exit" : "",
    seat.genderRestriction ? "Ladies seat" : "",
    `INR ${seat.fare.amount}`,
  ].filter(Boolean);

  return `${seat.seatNumber}: ${flags.join(", ")}`;
}

/** Times are shown on the clock in India, whatever the browser's zone. */
function formatTime(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? iso
    : new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        hour12: true,
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }).format(date);
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? iso
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        hour: "numeric",
        hour12: true,
        minute: "2-digit",
        month: "short",
        timeZone: "Asia/Kolkata",
      }).format(date);
}

function formatInr(amount: number): string {
  return `INR ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return `${hours}h ${remaining}m`;
}
