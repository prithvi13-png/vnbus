import { randomBytes } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  BoardingDroppingPoint,
  BookingFareSummary,
  BookingPassengerInput,
  BookingRecord,
  BookingStatus,
  BusSearchResult,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";
import { PrismaService } from "../../../shared/prisma/prisma.service";

const summary = {
  module: "booking",
  boundedContext: "Booking lifecycle",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Supplier booking",
      description: "Block and book seats with the bus supplier, then issue the ticket.",
    },
    {
      name: "Confirmation records",
      description: "Keep supplier PNR and internal booking references separate.",
    },
    {
      name: "Cancellation",
      description: "Cancel seats with the supplier and track the refund.",
    },
  ],
} satisfies ModuleSummary;

const bookingInclude = {
  passengers: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.BookingInclude;

type BookingRow = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

/**
 * What the booking looked like when it was made. Stored whole so a ticket
 * reprinted next month shows the trip, points and fare the traveller bought,
 * even after the supplier's search session is long gone.
 */
interface BookingDetails {
  trip: BusSearchResult;
  boardingPoint: BoardingDroppingPoint;
  droppingPoint: BoardingDroppingPoint;
  fare: BookingFareSummary;
  selectedSeats: string[];
  agentId?: string | null;
  customerId?: string | null;
  emailPrepared?: boolean;
}

export interface NewBooking {
  userId: string;
  channel: "CUSTOMER" | "AGENT";
  agentId: string | null;
  customerId: string | null;
  supplierCode: string;
  supplierBlockId: string;
  status: BookingStatus;
  journeyDate: string;
  trip: BusSearchResult;
  boardingPoint: BoardingDroppingPoint;
  droppingPoint: BoardingDroppingPoint;
  passengers: BookingPassengerInput[];
  fare: BookingFareSummary;
}

export interface BookingUpdate {
  status?: BookingStatus;
  supplierBookingId?: string | null;
  pnr?: string | null;
  ticketNumber?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  emailPrepared?: boolean;
}

@Injectable()
export class BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSummary(): ModuleSummary {
    return summary;
  }

  async create(input: NewBooking): Promise<BookingRecord> {
    const details: BookingDetails = {
      trip: input.trip,
      boardingPoint: input.boardingPoint,
      droppingPoint: input.droppingPoint,
      fare: input.fare,
      selectedSeats: input.passengers.map((passenger) => passenger.seatNumber),
      agentId: input.agentId,
      customerId: input.customerId,
      emailPrepared: false,
    };

    const row = await this.prisma.booking.create({
      data: {
        bookingReference: createBookingReference(),
        userId: input.userId,
        channel: input.channel,
        supplierCode: input.supplierCode,
        supplierBlockId: input.supplierBlockId,
        tripId: input.trip.tripId,
        sourceCity: input.trip.sourceCity,
        destinationCity: input.trip.destinationCity,
        journeyDate: new Date(`${input.journeyDate}T00:00:00.000Z`),
        departureTime: new Date(input.trip.departureTime),
        arrivalTime: new Date(input.trip.arrivalTime),
        boardingPointId: input.boardingPoint.id,
        boardingPointName: input.boardingPoint.name,
        droppingPointId: input.droppingPoint.id,
        droppingPointName: input.droppingPoint.name,
        status: input.status,
        seatCount: input.passengers.length,
        baseFare: input.fare.baseFare.amount,
        taxAmount: input.fare.taxes.amount,
        discountAmount: input.fare.discount.amount,
        totalAmount: input.fare.grandTotal.amount,
        currency: input.fare.grandTotal.currency,
        details: details as unknown as Prisma.InputJsonValue,
        passengers: {
          create: input.passengers.map((passenger) => ({
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            fullName: `${passenger.firstName} ${passenger.lastName}`.trim(),
            age: passenger.age,
            gender: passenger.gender,
            phone: passenger.phone,
            email: passenger.email,
            emergencyContact: passenger.emergencyContact ?? null,
            seatNumber: passenger.seatNumber,
          })),
        },
      },
      include: bookingInclude,
    });

    return toBookingRecord(row);
  }

  async update(bookingId: string, patch: BookingUpdate): Promise<BookingRecord> {
    const data: Prisma.BookingUpdateInput = {};

    if (patch.status !== undefined) {
      data.status = patch.status;
    }
    if (patch.supplierBookingId !== undefined) {
      data.supplierBookingId = patch.supplierBookingId;
    }
    if (patch.pnr !== undefined) {
      data.pnr = patch.pnr;
    }
    if (patch.ticketNumber !== undefined) {
      data.ticketNumber = patch.ticketNumber;
    }
    if (patch.confirmedAt !== undefined) {
      data.confirmedAt = patch.confirmedAt ? new Date(patch.confirmedAt) : null;
    }
    if (patch.cancelledAt !== undefined) {
      data.cancelledAt = patch.cancelledAt ? new Date(patch.cancelledAt) : null;
    }
    if (patch.emailPrepared !== undefined) {
      const current = await this.prisma.booking.findUniqueOrThrow({
        where: { id: bookingId },
        select: { details: true },
      });
      data.details = {
        ...(current.details as Record<string, unknown>),
        emailPrepared: patch.emailPrepared,
      };
    }

    const row = await this.prisma.booking.update({
      where: { id: bookingId },
      data,
      include: bookingInclude,
    });

    return toBookingRecord(row);
  }

  async findById(bookingId: string): Promise<BookingRecord | null> {
    if (!isUuid(bookingId)) {
      return null;
    }

    const row = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: bookingInclude,
    });

    return row ? toBookingRecord(row) : null;
  }

  /** The id of the user who made the booking, for ownership checks. */
  async findOwnerId(bookingId: string): Promise<string | null> {
    if (!isUuid(bookingId)) {
      return null;
    }

    const row = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true },
    });

    return row?.userId ?? null;
  }

  async listForUser(userId: string): Promise<BookingRecord[]> {
    const rows = await this.prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
    });

    return rows.map(toBookingRecord);
  }

  async listAll(): Promise<BookingRecord[]> {
    const rows = await this.prisma.booking.findMany({
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
    });

    return rows.map(toBookingRecord);
  }
}

function toBookingRecord(row: BookingRow): BookingRecord {
  const details = row.details as unknown as BookingDetails;
  const passengers: BookingPassengerInput[] = row.passengers.map((passenger) => ({
    seatNumber: passenger.seatNumber,
    firstName: passenger.firstName ?? passenger.fullName,
    lastName: passenger.lastName ?? "",
    age: passenger.age,
    gender: passenger.gender,
    phone: passenger.phone ?? "",
    email: passenger.email ?? "",
    ...(passenger.emergencyContact ? { emergencyContact: passenger.emergencyContact } : {}),
  }));

  return {
    bookingId: row.id,
    bookingReference: row.bookingReference,
    channel: row.channel === "AGENT" ? "AGENT" : "CUSTOMER",
    agentId: details.agentId ?? null,
    customerId: details.customerId ?? null,
    supplierCode: row.supplierCode ?? details.trip.supplierCode,
    supplierBookingId: row.supplierBookingId,
    pnr: row.pnr,
    ticketNumber: row.ticketNumber,
    status: row.status,
    trip: details.trip,
    selectedSeats: details.selectedSeats ?? passengers.map((passenger) => passenger.seatNumber),
    boardingPoint: details.boardingPoint,
    droppingPoint: details.droppingPoint,
    passengers,
    fare: details.fare,
    reservationId: row.supplierBlockId ?? "",
    createdAt: row.createdAt.toISOString(),
    expiresAt: null,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    emailPrepared: details.emailPrepared ?? false,
  };
}

/** "VNB-" and ten characters from an alphabet with no look-alike letters. */
function createBookingReference(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(10);

  return `VNB-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join("")}`;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu.test(value);
}
