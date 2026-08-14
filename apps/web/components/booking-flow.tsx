"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  Armchair,
  CalendarClock,
  CheckCircle2,
  Download,
  Mail,
  QrCode,
  RefreshCw,
  Ticket,
  Timer,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type {
  BoardingDroppingPoint,
  BookingRecord,
  BookingTimelineEvent,
  BusSearchResult,
  SeatLayoutDetails,
  SeatMapSeat,
  SeatStatus,
  TicketRecord,
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
import { todayIsoDate } from "@vnbus/shared";

import {
  confirmBooking,
  cancelBooking,
  createBooking,
  downloadTicketPdf,
  emailTicket,
  getTicket,
  getSeatLayout,
  holdSeats,
  releaseSeats,
  rescheduleBooking,
  searchBuses,
} from "../lib/api-client";
import { useBookingStore } from "../lib/booking-store";
import { InvoiceDownloadButton } from "./invoice-download-button";

const passengerSchema = z.object({
  passengers: z.array(
    z.object({
      seatNumber: z.string().min(1),
      firstName: z.string().min(2, "First name is required"),
      lastName: z.string().min(2, "Last name is required"),
      age: z.number().int().min(1, "Enter a valid age").max(110, "Enter a valid age"),
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

const statusStyles: Record<SeatStatus | "SELECTED", string> = {
  AVAILABLE: "border-gray-300 bg-white text-gray-800 hover:border-gold-500 hover:bg-gold-50",
  BOOKED: "cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400",
  LADIES: "border-pink-300 bg-pink-50 text-pink-700 hover:border-pink-500",
  RESERVED: "cursor-not-allowed border-gold-200 bg-gold-50 text-gold-700",
  BLOCKED: "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400",
  SELECTED: "border-brand-700 bg-brand-700 text-white shadow-sm",
};

export function SeatSelectionFlow(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams?.get("tripId") ?? "mock-route-001-1";
  const journeyDate = searchParams?.get("date") ?? todayIsoDate();
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const setLayout = useBookingStore((state) => state.setLayout);
  const layout = useBookingStore((state) => state.layout);
  const toggleSeat = useBookingStore((state) => state.toggleSeat);
  const boardingPoint = useBookingStore((state) => state.boardingPoint);
  const droppingPoint = useBookingStore((state) => state.droppingPoint);
  const setBoardingPoint = useBookingStore((state) => state.setBoardingPoint);
  const setDroppingPoint = useBookingStore((state) => state.setDroppingPoint);
  const setHold = useBookingStore((state) => state.setHold);
  const clearHold = useBookingStore((state) => state.clearHold);
  const hold = useBookingStore((state) => state.hold);
  const secondsLeft = useSeatHoldTimer();
  const [error, setError] = React.useState<string | null>(null);
  const query = useQuery({
    queryKey: ["seat-layout", tripId, journeyDate],
    queryFn: () => getSeatLayout(tripId, journeyDate),
  });

  React.useEffect(() => {
    if (query.data) {
      setLayout(query.data);
    }
  }, [query.data, setLayout]);

  const activeLayout = query.data ?? layout;
  const selectedSeatModels = React.useMemo(
    () => getSelectedSeatModels(activeLayout, selectedSeats),
    [activeLayout, selectedSeats],
  );
  const selectedFare = selectedSeatModels.reduce((total, seat) => total + seat.fare.amount, 0);

  async function continueToPassengers(): Promise<void> {
    if (!activeLayout || !boardingPoint || !droppingPoint) {
      setError("Select seats, boarding point, and dropping point");

      return;
    }
    if (!selectedSeats.length) {
      setError("Select at least one seat");

      return;
    }

    try {
      setError(null);
      const response = await holdSeats({
        supplierCode: activeLayout.supplierCode,
        tripId: activeLayout.tripId,
        journeyDate: activeLayout.journeyDate,
        seatNumbers: selectedSeats,
      });
      setHold(response);
      router.push("/passenger-details");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Seat hold failed");
    }
  }

  if (query.isLoading || !activeLayout) {
    return <BookingSkeleton />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="grid gap-5">
        <TripStrip layout={activeLayout} />
        {error ? (
          <Alert variant="danger">
            <AlertTitle>Seat hold failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <SeatLegend />
        <div className="grid gap-5">
          {activeLayout.decks.map((deck) => (
            <Card key={deck.deck}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>{deck.label}</CardTitle>
                  <CardDescription>
                    {activeLayout.vehicleLayout} · {activeLayout.axleType}
                  </CardDescription>
                </div>
                <Badge variant="neutral">Driver</Badge>
              </CardHeader>
              <CardContent>
                <div
                  className="mx-auto grid max-w-2xl gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${deck.columns}, minmax(48px, 1fr))`,
                  }}
                >
                  {Array.from({ length: deck.rows * deck.columns }, (_, index) => {
                    const row = Math.floor(index / deck.columns) + 1;
                    const column = (index % deck.columns) + 1;
                    const seat = deck.seats.find(
                      (item) => item.row === row && item.column === column,
                    );
                    if (!seat) {
                      return <div key={`${deck.deck}-${row}-${column}`} aria-hidden="true" />;
                    }

                    const selected = selectedSeats.includes(seat.seatNumber);
                    const selectable = isSeatSelectable(seat);

                    return (
                      <button
                        key={seat.seatNumber}
                        type="button"
                        disabled={!selectable}
                        title={seatTooltip(seat)}
                        aria-label={seatTooltip(seat)}
                        aria-pressed={selected}
                        onClick={() => toggleSeat(seat.seatNumber, activeLayout.maxSelectableSeats)}
                        className={cn(
                          "flex min-h-14 flex-col items-center justify-center rounded-md border text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
                          selected ? statusStyles.SELECTED : statusStyles[seat.status],
                        )}
                      >
                        <Armchair className="mb-1 h-4 w-4" aria-hidden="true" />
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <PointPicker
            title="Boarding Point"
            points={activeLayout.boardingPoints}
            selectedId={boardingPoint?.id}
            onSelect={setBoardingPoint}
            showMap
          />
          <PointPicker
            title="Dropping Point"
            points={activeLayout.droppingPoints}
            selectedId={droppingPoint?.id}
            onSelect={setDroppingPoint}
          />
        </div>
      </section>
      <aside className="h-max rounded-lg border border-gold-100 bg-white p-5 shadow-sm dark:border-brand-900 dark:bg-brand-950 lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-brand-900 dark:text-white">Selection</h2>
          {hold ? <HoldTimer secondsLeft={secondsLeft} /> : null}
        </div>
        <div className="mt-4 grid gap-3 text-sm">
          <SummaryRow label="Seats" value={selectedSeats.join(", ") || "None"} />
          <SummaryRow label="Boarding" value={boardingPoint?.name ?? "Select point"} />
          <SummaryRow label="Dropping" value={droppingPoint?.name ?? "Select point"} />
          <SummaryRow label="Base fare" value={`INR ${selectedFare.toLocaleString("en-IN")}`} />
        </div>
        {hold ? (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => {
              void releaseSeats({ reservationId: hold.reservationId });
              clearHold();
            }}
          >
            Release held seats
          </Button>
        ) : null}
        <Button type="button" className="mt-4 w-full" onClick={() => void continueToPassengers()}>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Continue
        </Button>
      </aside>
    </div>
  );
}

export function PassengerDetailsFlow(): React.JSX.Element {
  const router = useRouter();
  const layout = useBookingStore((state) => state.layout);
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const passengers = useBookingStore((state) => state.passengers);
  const setPassengers = useBookingStore((state) => state.setPassengers);
  const secondsLeft = useSeatHoldTimer();
  const form = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      passengers: selectedSeats.map((seatNumber, index) => ({
        seatNumber,
        firstName: passengers[index]?.firstName ?? "",
        lastName: passengers[index]?.lastName ?? "",
        age: passengers[index]?.age ?? 30,
        gender: passengers[index]?.gender ?? "MALE",
        phone: passengers[index]?.phone ?? "+919876543210",
        email: passengers[index]?.email ?? "traveller@example.com",
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
      className="grid gap-5"
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
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Passenger Details</CardTitle>
            <CardDescription>One passenger is required for every selected seat.</CardDescription>
          </div>
          <HoldTimer secondsLeft={secondsLeft} />
        </CardHeader>
      </Card>
      {selectedSeats.map((seatNumber, index) => (
        <Card key={seatNumber}>
          <CardHeader>
            <CardTitle className="text-base">Seat {seatNumber}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
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
            <Field label="Phone" error={form.formState.errors.passengers?.[index]?.phone?.message}>
              <Input {...form.register(`passengers.${index}.phone`)} />
            </Field>
            <Field label="Email" error={form.formState.errors.passengers?.[index]?.email?.message}>
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
      <div className="flex flex-wrap justify-between gap-3">
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
  const hold = useBookingStore((state) => state.hold);
  const booking = useBookingStore((state) => state.booking);
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const boardingPoint = useBookingStore((state) => state.boardingPoint);
  const droppingPoint = useBookingStore((state) => state.droppingPoint);
  const passengers = useBookingStore((state) => state.passengers);
  const setBooking = useBookingStore((state) => state.setBooking);
  const setConfirmation = useBookingStore((state) => state.setConfirmation);
  const secondsLeft = useSeatHoldTimer();
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const fare = booking?.fare ?? hold?.fare;

  async function confirm(): Promise<void> {
    if (!layout || !hold || !boardingPoint || !droppingPoint || !passengers.length) {
      setError("Booking session is incomplete or expired");

      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const bookingRecord =
        booking ??
        (await createBooking({
          reservationId: hold.reservationId,
          supplierCode: layout.supplierCode,
          tripId: layout.tripId,
          journeyDate: layout.journeyDate,
          selectedSeats,
          boardingPointId: boardingPoint.id,
          droppingPointId: droppingPoint.id,
          passengers,
        }));
      setBooking(bookingRecord);
      const confirmation = await confirmBooking({
        bookingId: bookingRecord.bookingId,
        paymentReference: "MOCK-PAYMENT-SUCCESS",
      });
      setConfirmation(confirmation);
      router.push(`/booking-confirmation?bookingId=${confirmation.booking.bookingId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Booking failed");
      router.push("/booking-failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!layout || !hold || !fare) {
    return (
      <EmptyState
        title="Booking session expired"
        description="Please select seats again to restart the hold timer."
        actionLabel="Select seats"
        onAction={() => router.push("/seat-layout")}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="grid gap-5">
        <TripStrip layout={layout} />
        {error ? (
          <Alert variant="danger">
            <AlertTitle>Booking failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>Booking Review</CardTitle>
            <CardDescription>Confirm passenger, route, point, and fare details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <SummaryTile label="Seats" value={selectedSeats.join(", ")} />
            <SummaryTile label="Passengers" value={`${passengers.length}`} />
            <SummaryTile
              label="Boarding"
              value={`${boardingPoint?.time} · ${boardingPoint?.name}`}
            />
            <SummaryTile
              label="Dropping"
              value={`${droppingPoint?.time} · ${droppingPoint?.name}`}
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
                className="flex flex-wrap justify-between gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800"
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
      </section>
      <aside className="h-max rounded-lg border border-gold-100 bg-white p-5 shadow-sm dark:border-brand-900 dark:bg-brand-950 lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-900 dark:text-white">Fare Summary</h2>
          <HoldTimer secondsLeft={secondsLeft} />
        </div>
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
      <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
        <div className="grid gap-4">
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
        </div>
        <div className="flex aspect-square items-center justify-center rounded-lg border border-gold-100 bg-brand-50 dark:border-brand-900 dark:bg-brand-950">
          <QrCode className="h-24 w-24 text-gold-600 dark:text-gold-100" aria-hidden="true" />
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
  const bookingId = searchParams?.get("bookingId");
  const activeBooking = useBookingStore((state) => state.booking);
  const activeTicket = useBookingStore((state) => state.ticket);
  const history = useBookingStore((state) => state.history);
  const tickets = useBookingStore((state) => state.tickets);
  const setTicket = useBookingStore((state) => state.setTicket);
  const recordTicketDownload = useBookingStore((state) => state.recordTicketDownload);
  const [downloading, setDownloading] = React.useState(false);
  const booking = bookingId
    ? (history.find((item) => item.bookingId === bookingId) ??
      (activeBooking?.bookingId === bookingId ? activeBooking : null))
    : activeBooking;
  const ticket = booking
    ? (tickets.find((item) => item.bookingId === booking.bookingId) ??
      (activeTicket?.bookingId === booking.bookingId ? activeTicket : null))
    : activeTicket;

  React.useEffect(() => {
    if (booking && !ticket) {
      void getTicket(booking)
        .then(setTicket)
        .catch(() => undefined);
    }
  }, [booking, setTicket, ticket]);

  if (!booking || !ticket) {
    return (
      <EmptyState
        title="Ticket not available"
        description="Confirm a booking to generate a ticket."
        actionLabel="Search buses"
        onAction={() => {
          window.location.href = "/search";
        }}
      />
    );
  }

  async function download(): Promise<void> {
    if (!booking || !ticket) {
      return;
    }
    setDownloading(true);
    const pdf = await downloadTicketPdf(booking);
    const link = document.createElement("a");
    link.href = `data:${pdf.mimeType};base64,${pdf.base64}`;
    link.download = pdf.fileName;
    link.click();
    if (pdf.ticketId && pdf.downloadStatus) {
      recordTicketDownload(pdf.ticketId, pdf.downloadStatus);
      setTicket({
        ...ticket,
        status: "DOWNLOADED",
        lastDownloadedAt: pdf.downloadedAt ?? new Date().toISOString(),
      });
    }
    setDownloading(false);
  }

  return (
    <Card>
      <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
        <div className="grid gap-4">
          <div>
            <Badge>Vriddhi Nexus Pvt Ltd</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-gray-950 dark:text-gray-50">
              {ticket.ticketNumber}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">PNR {ticket.pnr}</p>
          </div>
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
              value={`${booking.boardingPoint.time} · ${booking.boardingPoint.name}`}
            />
            <SummaryTile
              label="Dropping"
              value={`${booking.droppingPoint.time} · ${booking.droppingPoint.name}`}
            />
            <SummaryTile
              label="Emergency Contact"
              value={booking.passengers[0]?.emergencyContact ?? "Not provided"}
            />
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
        <div className="grid gap-3 lg:justify-items-center">
          <div className="flex aspect-square w-full max-w-[260px] self-start items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <span
              className="block h-40 w-40"
              aria-label="Ticket verification QR code"
              role="img"
              dangerouslySetInnerHTML={{ __html: ticket.qrCode.svg }}
            />
          </div>
          <p className="w-full max-w-[260px] break-all text-xs text-gray-500 dark:text-gray-400">
            {ticket.qrPayload}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingHistoryDetailFlow(): React.JSX.Element {
  const params = useParams<{ bookingId: string }>();
  const history = useBookingStore((state) => state.history);
  const currentBooking = useBookingStore((state) => state.booking);
  const booking =
    history.find((item) => item.bookingId === params?.bookingId) ??
    (currentBooking?.bookingId === params?.bookingId ? currentBooking : null);

  if (!booking) {
    return (
      <EmptyState
        title="Booking not found"
        description="The mock booking may belong to another browser session."
        actionLabel="View booking history"
        onAction={() => {
          window.location.href = "/booking-history";
        }}
      />
    );
  }

  return <BookingDetails booking={booking} />;
}

function TripStrip({ layout }: { layout: SeatLayoutDetails }): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-950 dark:text-gray-50">
            {layout.operatorName} · {layout.busType}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {layout.sourceCity} to {layout.destinationCity} · {layout.journeyDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Tag>{formatTime(layout.departureTime)}</Tag>
          <Tag>{formatDuration(layout.durationMinutes)}</Tag>
          <Tag>{layout.vehicleLayout}</Tag>
        </div>
      </CardContent>
    </Card>
  );
}

function SeatLegend(): React.JSX.Element {
  const items: Array<[string, SeatStatus | "SELECTED"]> = [
    ["Available", "AVAILABLE"],
    ["Booked", "BOOKED"],
    ["Ladies", "LADIES"],
    ["Selected", "SELECTED"],
    ["Blocked", "BLOCKED"],
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([label, status]) => (
        <span
          key={status}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium dark:border-gray-800 dark:bg-gray-950"
        >
          <span className={cn("h-4 w-4 rounded border", statusStyles[status])} />
          {label}
        </span>
      ))}
    </div>
  );
}

function PointPicker({
  onSelect,
  points,
  selectedId,
  showMap = false,
  title,
}: {
  onSelect: (point: BoardingDroppingPoint) => void;
  points: BoardingDroppingPoint[];
  selectedId: string | undefined;
  showMap?: boolean;
  title: string;
}): React.JSX.Element {
  const selected = points.find((point) => point.id === selectedId) ?? points[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {points.map((point) => (
          <button
            key={point.id}
            type="button"
            onClick={() => onSelect(point)}
            className={cn(
              "rounded-md border p-3 text-left text-sm transition",
              selectedId === point.id
                ? "border-gold-500 bg-gold-50 dark:bg-gold-500/10"
                : "border-gray-200 bg-white hover:border-gold-200 dark:border-brand-900 dark:bg-brand-950",
            )}
          >
            <span className="flex justify-between gap-3">
              <span className="font-semibold text-gray-950 dark:text-gray-50">{point.name}</span>
              <span className="text-gray-600 dark:text-gray-400">{point.time}</span>
            </span>
            <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
              {point.address} · {point.landmark}
            </span>
          </button>
        ))}
        {showMap && selected ? (
          <iframe
            title={`${selected.name} map preview`}
            className="h-44 w-full rounded-md border border-gold-100 dark:border-brand-900"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?marker=${selected.latitude},${selected.longitude}&layer=mapnik`}
          />
        ) : null}
      </CardContent>
    </Card>
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
      <span className="text-xs font-semibold uppercase tracking-normal text-gray-600 dark:text-gray-400">
        {label}
      </span>
      {children}
      <span className="min-h-4 text-xs text-red-600 dark:text-red-300">{error}</span>
    </label>
  );
}

function BookingDetails({ booking }: { booking: BookingRecord }): React.JSX.Element {
  const router = useRouter();
  const storedTickets = useBookingStore((state) => state.tickets);
  const activeTicket = useBookingStore((state) => state.ticket);
  const storeTimeline = useBookingStore((state) => state.timeline);
  const setTicket = useBookingStore((state) => state.setTicket);
  const upsertBooking = useBookingStore((state) => state.upsertBooking);
  const addTimeline = useBookingStore((state) => state.addTimeline);
  const addNotification = useBookingStore((state) => state.addNotification);
  const recordTicketDownload = useBookingStore((state) => state.recordTicketDownload);
  const [working, setWorking] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = React.useState(() => futureDateValue(3));
  const [rescheduleResults, setRescheduleResults] = React.useState<BusSearchResult[]>([]);
  const [selectedRescheduleTripId, setSelectedRescheduleTripId] = React.useState<string>("");
  const ticket =
    storedTickets.find((item) => item.bookingId === booking.bookingId) ??
    (activeTicket?.bookingId === booking.bookingId ? activeTicket : null);
  const timeline = getTimelineForBooking(booking, storeTimeline);
  const cancellable = !["CANCELLED", "EXPIRED", "FAILED"].includes(booking.status);

  React.useEffect(() => {
    if (!ticket && ["CONFIRMED", "TICKET_GENERATED", "RESCHEDULED"].includes(booking.status)) {
      void getTicketForBooking(booking)
        .then(setTicket)
        .catch(() => undefined);
    }
  }, [booking, setTicket, ticket]);

  async function download(): Promise<void> {
    const active = ticket ?? (await getTicketForBooking(booking));

    try {
      setWorking("download");
      setError(null);
      const pdf = await downloadTicketPdf(booking);
      const link = document.createElement("a");
      link.href = `data:${pdf.mimeType};base64,${pdf.base64}`;
      link.download = pdf.fileName;
      link.click();
      if (pdf.ticketId && pdf.downloadStatus) {
        recordTicketDownload(pdf.ticketId, pdf.downloadStatus);
      }
      setTicket({
        ...active,
        status: "DOWNLOADED",
        lastDownloadedAt: pdf.downloadedAt ?? new Date().toISOString(),
      });
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
      addTimeline([
        createClientTimelineEvent(
          booking.bookingId,
          "EMAIL_SENT",
          "Ticket emailed",
          `Ticket email recorded by mock email log ${response.emailLogId}.`,
          "info",
        ),
      ]);
      addNotification({
        id: createClientId("NTF", `${booking.bookingId}|${response.emailLogId}`),
        type: "EMAIL_HISTORY",
        readStatus: "UNREAD",
        title: "Ticket email sent",
        body: `Ticket email queued for ${booking.bookingReference}.`,
        bookingId: booking.bookingId,
        emailLogId: response.emailLogId,
        createdAt: new Date().toISOString(),
        readAt: null,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Email failed");
    } finally {
      setWorking(null);
    }
  }

  async function requestCancellation(): Promise<void> {
    try {
      setWorking("cancel");
      setError(null);
      const response = await cancelBooking({
        bookingId: booking.bookingId,
        reason: "Cancelled from booking details",
      });
      upsertBooking(response.booking);
      addTimeline(response.timeline);
      addNotification({
        id: createClientId("NTF", `${booking.bookingId}|cancelled`),
        type: "CANCELLATION_UPDATE",
        readStatus: "UNREAD",
        title: "Booking cancelled",
        body: `${booking.bookingReference} was cancelled. Refund status is pending.`,
        bookingId: booking.bookingId,
        createdAt: new Date().toISOString(),
        readAt: null,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Cancellation failed");
    } finally {
      setWorking(null);
    }
  }

  async function searchRescheduleBuses(): Promise<void> {
    try {
      setWorking("search-reschedule");
      setError(null);
      const response = await searchBuses({
        sourceCity: booking.trip.sourceCity,
        destinationCity: booking.trip.destinationCity,
        journeyDate: rescheduleDate,
        passengerCount: booking.passengers.length,
      });
      setRescheduleResults(response.buses.slice(0, 3));
      setSelectedRescheduleTripId(response.buses[0]?.tripId ?? "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Reschedule search failed");
    } finally {
      setWorking(null);
    }
  }

  async function confirmReschedule(): Promise<void> {
    try {
      setWorking("reschedule");
      setError(null);
      const response = await rescheduleBooking({
        bookingId: booking.bookingId,
        newJourneyDate: rescheduleDate,
        ...(selectedRescheduleTripId ? { newTripId: selectedRescheduleTripId } : {}),
      });
      upsertBooking(response.booking);
      addTimeline(response.timeline);
      addNotification({
        id: createClientId("NTF", `${booking.bookingId}|rescheduled|${rescheduleDate}`),
        type: "RESCHEDULE_UPDATE",
        readStatus: "UNREAD",
        title: "Booking rescheduled",
        body: `${booking.bookingReference} moved to ${rescheduleDate}.`,
        bookingId: booking.bookingId,
        createdAt: new Date().toISOString(),
        readAt: null,
      });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Reschedule failed");
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
          <SummaryTile label="PNR" value={booking.pnr ?? "Pending"} />
          <SummaryTile
            label="Total"
            value={`INR ${booking.fare.grandTotal.amount.toLocaleString("en-IN")}`}
          />
        </CardContent>
      </Card>
      {error ? (
        <Alert variant="danger">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SummaryTile label="Ticket ID" value={ticket?.ticketId ?? "Generating"} />
          <SummaryTile label="Ticket Number" value={ticket?.ticketNumber ?? "Generating"} />
          <SummaryTile label="Bus Number" value={ticket?.busNumber ?? "MOCK"} />
          <SummaryTile label="Support" value={ticket?.supportContact.phone ?? "+91-80-4567-8899"} />
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Button type="button" onClick={() => void download()} loading={working === "download"}>
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
            items={timeline.map((event) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              timestamp: formatDateTime(event.occurredAt),
              tone: event.tone,
            }))}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cancel Booking</CardTitle>
          <CardDescription>Refund handoff remains a placeholder in this milestone.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            disabled={!cancellable}
            loading={working === "cancel"}
            onClick={() => void requestCancellation()}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Cancel Booking
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Reschedule Booking</CardTitle>
          <CardDescription>
            Choose a new date, pick a mock bus, review, and confirm.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-[220px_auto]">
            <Field label="New Date" error={undefined}>
              <Input
                type="date"
                value={rescheduleDate}
                min={futureDateValue(1)}
                onChange={(event) => setRescheduleDate(event.target.value)}
              />
            </Field>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                loading={working === "search-reschedule"}
                onClick={() => void searchRescheduleBuses()}
              >
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Search Buses
              </Button>
            </div>
          </div>
          {rescheduleResults.length ? (
            <div className="grid gap-2">
              {rescheduleResults.map((bus) => (
                <button
                  key={bus.tripId}
                  type="button"
                  onClick={() => setSelectedRescheduleTripId(bus.tripId)}
                  className={cn(
                    "rounded-md border p-3 text-left text-sm transition",
                    selectedRescheduleTripId === bus.tripId
                      ? "border-gold-500 bg-gold-50 dark:bg-gold-500/10"
                      : "border-gray-200 bg-white hover:border-gold-200 dark:border-brand-900 dark:bg-brand-950",
                  )}
                >
                  <span className="flex flex-wrap justify-between gap-3">
                    <span className="font-semibold text-gray-950 dark:text-gray-50">
                      {bus.operatorName}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      INR {bus.fare.amount.toLocaleString("en-IN")}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                    {formatTime(bus.departureTime)} · {formatDuration(bus.durationMinutes)} ·{" "}
                    {bus.busType}
                  </span>
                </button>
              ))}
              <Button
                type="button"
                className="w-fit"
                loading={working === "reschedule"}
                onClick={() => void confirmReschedule()}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Confirm Reschedule
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function FareSummary({ fare }: { fare: NonNullable<BookingRecord["fare"]> }): React.JSX.Element {
  return (
    <div className="mt-4 grid gap-3 text-sm">
      <SummaryRow label="Base Fare" value={`INR ${fare.baseFare.amount.toLocaleString("en-IN")}`} />
      <SummaryRow label="Taxes" value={`INR ${fare.taxes.amount.toLocaleString("en-IN")}`} />
      <SummaryRow
        label="Discount"
        value={`- INR ${fare.discount.amount.toLocaleString("en-IN")}`}
      />
      <SummaryRow
        label="Convenience Fee"
        value={`INR ${fare.convenienceFee.amount.toLocaleString("en-IN")}`}
      />
      <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
        <SummaryRow
          label="Grand Total"
          value={`INR ${fare.grandTotal.amount.toLocaleString("en-IN")}`}
        />
      </div>
    </div>
  );
}

async function getTicketForBooking(booking: BookingRecord): Promise<TicketRecord> {
  return getTicket(booking);
}

function getTimelineForBooking(
  booking: BookingRecord,
  events: BookingTimelineEvent[],
): BookingTimelineEvent[] {
  const scoped = events.filter((event) => event.bookingId === booking.bookingId);
  if (scoped.length) {
    return scoped;
  }

  const createdAt = booking.createdAt;
  const confirmedAt = booking.confirmedAt ?? booking.createdAt;
  const fallback = [
    createClientTimelineEvent(
      booking.bookingId,
      "BOOKING_CREATED",
      "Booking created",
      "Booking created from selected seats.",
      "info",
      createdAt,
    ),
    createClientTimelineEvent(
      booking.bookingId,
      "SEAT_RESERVED",
      "Seat reserved",
      `Seats ${booking.selectedSeats.join(", ")} reserved.`,
      "success",
      createdAt,
    ),
  ];

  if (["CONFIRMED", "TICKET_GENERATED", "RESCHEDULED"].includes(booking.status)) {
    fallback.push(
      createClientTimelineEvent(
        booking.bookingId,
        "TICKET_GENERATED",
        "Ticket generated",
        "Ticket generated from the internal ticket model.",
        "success",
        confirmedAt,
      ),
    );
  }
  if (booking.status === "CANCELLED") {
    fallback.push(
      createClientTimelineEvent(
        booking.bookingId,
        "CANCELLED",
        "Booking cancelled",
        "Mock cancellation completed.",
        "danger",
        booking.cancelledAt ?? new Date().toISOString(),
      ),
    );
  }

  return fallback;
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

function createClientTimelineEvent(
  bookingId: string,
  type: BookingTimelineEvent["type"],
  title: string,
  description: string,
  tone: BookingTimelineEvent["tone"],
  occurredAt = new Date().toISOString(),
): BookingTimelineEvent {
  return {
    id: createClientId("TL", `${bookingId}|${type}|${occurredAt}`),
    bookingId,
    type,
    title,
    description,
    occurredAt,
    tone,
  };
}

function createClientId(prefix: string, value: string): string {
  const hash = [...value].reduce(
    (current, char) => (current * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );

  return `${prefix}-${hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}

function futureDateValue(daysAhead: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysAhead);

  return date.toISOString().slice(0, 10);
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

function HoldTimer({ secondsLeft }: { secondsLeft: number }): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gold-50 px-2 py-1 text-xs font-semibold text-gold-700 dark:bg-gold-500/10 dark:text-gold-100">
      <Timer className="h-3.5 w-3.5" aria-hidden="true" />
      {formatCountdown(secondsLeft)}
    </span>
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

function useSeatHoldTimer(): number {
  const router = useRouter();
  const hold = useBookingStore((state) => state.hold);
  const layout = useBookingStore((state) => state.layout);
  const clearHold = useBookingStore((state) => state.clearHold);
  const [secondsLeft, setSecondsLeft] = React.useState(() => calculateSecondsLeft(hold?.expiresAt));

  React.useEffect(() => {
    setSecondsLeft(calculateSecondsLeft(hold?.expiresAt));
    if (!hold) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      const next = calculateSecondsLeft(hold.expiresAt);
      setSecondsLeft(next);
      if (next <= 0) {
        window.clearInterval(timer);
        void releaseSeats({ reservationId: hold.reservationId });
        clearHold();
        router.push(
          layout
            ? `/seat-layout?tripId=${layout.tripId}&date=${layout.journeyDate}`
            : "/seat-layout",
        );
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [clearHold, hold, layout, router]);

  return secondsLeft;
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

function calculateSecondsLeft(expiresAt: string | undefined): number {
  if (!expiresAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / 1000));
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return `${hours}h ${remaining}m`;
}
