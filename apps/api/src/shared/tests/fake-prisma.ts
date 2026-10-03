import { randomUUID } from "node:crypto";

import type { PrismaService } from "../prisma/prisma.service";

type Row = Record<string, unknown>;

interface BookingRow extends Row {
  id: string;
  userId: string;
  createdAt: Date;
  passengers: Row[];
}

interface TimelineRow extends Row {
  id: string;
  bookingId: string;
  occurredAt: Date;
}

export interface FakeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  roleCode: string;
  createdAt: Date;
  deletedAt: Date | null;
  agent: Row | null;
}

/**
 * An in-memory stand-in for the slice of Prisma the booking, timeline, admin
 * and agent repositories use, so their services can be tested without a
 * database. It implements only those calls, and only as those calls use them.
 */
export class FakePrisma {
  readonly bookings = new Map<string, BookingRow>();
  readonly timeline: TimelineRow[] = [];
  readonly users: FakeUser[] = [];
  failNextBookingUpdate = false;

  readonly booking = {
    create: ({ data }: { data: Row }): Promise<BookingRow> => {
      const id = randomUUID();
      const now = new Date();
      const { passengers, ...fields } = data as Row & { passengers?: { create?: Row[] } };
      const row: BookingRow = {
        customerId: null,
        agentId: null,
        couponId: null,
        supplierBookingId: null,
        pnr: null,
        ticketNumber: null,
        confirmedAt: null,
        cancelledAt: null,
        rescheduledAt: null,
        newJourneyDate: null,
        ...fields,
        id,
        userId: String(fields.userId),
        createdAt: now,
        updatedAt: now,
        passengers: (passengers?.create ?? []).map((passenger) => ({
          id: randomUUID(),
          bookingId: id,
          createdAt: now,
          ...passenger,
        })),
      };

      this.bookings.set(id, row);

      return Promise.resolve(structuredClone(row));
    },
    update: ({ data, where }: { data: Row; where: { id: string } }): Promise<BookingRow> => {
      if (this.failNextBookingUpdate) {
        this.failNextBookingUpdate = false;

        return Promise.reject(new Error("database unavailable"));
      }

      const row = this.bookings.get(where.id);
      if (!row) {
        return Promise.reject(new Error(`No booking ${where.id}`));
      }

      Object.assign(row, data, { updatedAt: new Date() });

      return Promise.resolve(structuredClone(row));
    },
    findUnique: ({
      select,
      where,
    }: {
      select?: Row;
      where: { id: string };
    }): Promise<Row | null> => {
      const row = this.bookings.get(where.id);

      return Promise.resolve(row ? pick(structuredClone(row), select) : null);
    },
    findUniqueOrThrow: ({
      select,
      where,
    }: {
      select?: Row;
      where: { id: string };
    }): Promise<Row> => {
      const row = this.bookings.get(where.id);

      return row
        ? Promise.resolve(pick(structuredClone(row), select))
        : Promise.reject(new Error(`No booking ${where.id}`));
    },
    findMany: ({ where }: { where?: { userId?: string } } = {}): Promise<BookingRow[]> =>
      Promise.resolve(
        [...this.bookings.values()]
          .filter((row) => !where?.userId || row.userId === where.userId)
          .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
          .map((row) => structuredClone(row)),
      ),
  };

  readonly bookingTimeline = {
    create: ({
      data,
    }: {
      data: Row & { bookingId: string; occurredAt: Date };
    }): Promise<TimelineRow> => {
      const row: TimelineRow = {
        metadata: null,
        createdAt: new Date(),
        tone: "info",
        ...data,
        id: randomUUID(),
      };
      this.timeline.push(row);

      return Promise.resolve(structuredClone(row));
    },
    findMany: ({ where }: { where: { bookingId: { in: string[] } } }): Promise<TimelineRow[]> =>
      Promise.resolve(
        this.timeline
          .filter((row) => where.bookingId.in.includes(row.bookingId))
          .sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime())
          .map((row) => structuredClone(row)),
      ),
  };

  readonly user = {
    count: ({ where }: { where?: { role?: { code?: string } } } = {}): Promise<number> =>
      Promise.resolve(
        this.users.filter(
          (user) =>
            user.deletedAt === null && (!where?.role?.code || user.roleCode === where.role.code),
        ).length,
      ),
    findMany: ({ where }: { where?: { createdAt?: { gte?: Date } } } = {}): Promise<FakeUser[]> =>
      Promise.resolve(
        this.users.filter(
          (user) =>
            user.deletedAt === null &&
            (!where?.createdAt?.gte || user.createdAt >= where.createdAt.gte),
        ),
      ),
    findUniqueOrThrow: ({ where }: { where: { id: string } }): Promise<FakeUser> => {
      const user = this.users.find((candidate) => candidate.id === where.id);

      return user
        ? Promise.resolve(structuredClone(user))
        : Promise.reject(new Error(`No user ${where.id}`));
    },
  };

  readonly activityLog = {
    findMany: (): Promise<Row[]> => Promise.resolve([]),
  };

  addUser(overrides: Partial<FakeUser> = {}): FakeUser {
    const user: FakeUser = {
      id: randomUUID(),
      firstName: "Test",
      lastName: "User",
      email: `${randomUUID()}@test.invalid`,
      phone: "+910000000000",
      status: "ACTIVE",
      roleCode: "CUSTOMER",
      createdAt: new Date(),
      deletedAt: null,
      agent: null,
      ...overrides,
    };
    this.users.push(user);

    return user;
  }

  asPrismaService(): PrismaService {
    return this as unknown as PrismaService;
  }
}

function pick(row: Row, select?: Row): Row {
  if (!select) {
    return row;
  }

  return Object.fromEntries(Object.keys(select).map((key) => [key, row[key]]));
}
