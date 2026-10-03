import type { ConfigService } from "@nestjs/config";
import type { BusSearchResult } from "@vnbus/types";

import { BookingRepository } from "../../modules/booking/repositories/booking.repository";
import { BookingService } from "../../modules/booking/services/booking.service";
import { BookingModuleValidator } from "../../modules/booking/validators/booking.validator";
import { CircuitBreakerService } from "../../modules/integration/services/circuit-breaker.service";
import { DuplicateTripDetectionService } from "../../modules/integration/services/duplicate-trip.service";
import { IntegrationConfigurationService } from "../../modules/integration/services/integration-configuration.service";
import { NormalizationService } from "../../modules/integration/services/normalization.service";
import { SupplierHealthService } from "../../modules/integration/services/supplier-health.service";
import { SupplierManagerService } from "../../modules/integration/services/supplier-manager.service";
import { SupplierRequestLogService } from "../../modules/integration/services/supplier-request-log.service";
import { TripCacheService } from "../../modules/integration/services/trip-cache.service";
import { NotificationRepository } from "../../modules/notification/repositories/notification.repository";
import { NotificationService } from "../../modules/notification/services/notification.service";
import { NotificationModuleValidator } from "../../modules/notification/validators/notification.validator";
import { SeatRepository } from "../../modules/seat/repositories/seat.repository";
import { SeatService } from "../../modules/seat/services/seat.service";
import { SeatModuleValidator } from "../../modules/seat/validators/seat.validator";
import { TicketMapper } from "../../modules/ticket/mappers/ticket.mapper";
import { TicketRepository } from "../../modules/ticket/repositories/ticket.repository";
import { TicketService } from "../../modules/ticket/services/ticket.service";
import { TicketModuleValidator } from "../../modules/ticket/validators/ticket.validator";
import { TimelineRepository } from "../../modules/timeline/repositories/timeline.repository";
import { TimelineService } from "../../modules/timeline/services/timeline.service";
import { TimelineModuleValidator } from "../../modules/timeline/validators/timeline.validator";
import { EmailLoggerService } from "../email/email-logger.service";
import { EmailQueueService } from "../email/email-queue.service";
import { EmailRetryStrategy } from "../email/email-retry.strategy";
import { EmailTemplateService } from "../email/email-template.service";
import { UnconfiguredEmailSender } from "../email/senders/unconfigured-email.sender";
import type { CreateBookingDto } from "../../modules/booking/dto/booking-workflow.dto";
import type { JwtPrincipal } from "../security/interfaces/jwt-principal.interface";
import { FakePrisma } from "./fake-prisma";
import { FakeSupplierAdapter } from "./fake-supplier";

/** Environment for the services under test: SRDV counts as configured. */
export function testConfig(values: Record<string, string> = {}): ConfigService {
  const settings: Record<string, string> = {
    SRDV_API_URL: "https://srdv.test/bus",
    SRDV_API_TOKEN: "test-token",
    ...values,
  };

  return { get: (key: string) => settings[key] } as unknown as ConfigService;
}

export function createSupplierManager(
  supplier = new FakeSupplierAdapter(),
  configuration = new IntegrationConfigurationService(testConfig()),
): SupplierManagerService {
  const manager = new SupplierManagerService(
    configuration,
    new NormalizationService(),
    new DuplicateTripDetectionService(),
    new SupplierRequestLogService(),
    new SupplierHealthService(),
    new CircuitBreakerService(),
    new TripCacheService(),
  );
  // Replaces the real SRDV adapter the manager registered from the config.
  manager.registerSupplier(supplier);

  return manager;
}

/**
 * The real booking, seat, ticket, timeline and notification services wired
 * together over an in-memory database and a fake supplier.
 */
export function createBookingHarness() {
  const prisma = new FakePrisma();
  const supplier = new FakeSupplierAdapter();
  const supplierManager = createSupplierManager(supplier);
  const seatService = new SeatService(
    new SeatRepository(),
    new SeatModuleValidator(),
    supplierManager,
  );
  const timelineService = new TimelineService(
    new TimelineRepository(prisma.asPrismaService()),
    new TimelineModuleValidator(),
  );
  const notificationService = new NotificationService(
    new NotificationRepository(),
    new NotificationModuleValidator(),
  );
  const emailService = new EmailQueueService(
    new EmailTemplateService(new UnconfiguredEmailSender()),
    new EmailLoggerService(),
    new EmailRetryStrategy(),
  );
  const bookingService = new BookingService(
    new BookingRepository(prisma.asPrismaService()),
    new BookingModuleValidator(),
    seatService,
    supplierManager,
    emailService,
    timelineService,
    notificationService,
  );
  const ticketService = new TicketService(
    new TicketRepository(),
    new TicketModuleValidator(),
    bookingService,
    new TicketMapper(),
    emailService,
    timelineService,
    notificationService,
  );

  return {
    prisma,
    supplier,
    supplierManager,
    seatService,
    timelineService,
    notificationService,
    emailService,
    bookingService,
    ticketService,
  };
}

export function principal(overrides: Partial<JwtPrincipal> = {}): JwtPrincipal {
  return {
    sub: "00000000-0000-4000-8000-000000000001",
    email: "traveller@test.invalid",
    roles: ["CUSTOMER"],
    permissions: [],
    ...overrides,
  };
}

export function futureDate(daysAhead = 10): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysAhead);

  return date.toISOString().slice(0, 10);
}

/** Runs a search so the trip is cached, as a traveller's search would. */
export async function searchTrip(
  manager: SupplierManagerService,
  journeyDate = futureDate(),
): Promise<BusSearchResult> {
  const response = await manager.searchTrips({
    sourceCity: "Bangalore",
    destinationCity: "Hyderabad",
    journeyDate,
    passengerCount: 1,
  });
  const trip = response.trips[0];

  if (!trip) {
    throw new Error("The fake supplier returned no trips");
  }

  return trip;
}

export function bookingRequest(
  trip: BusSearchResult,
  journeyDate: string,
  overrides: Partial<CreateBookingDto> = {},
): CreateBookingDto {
  return {
    supplierCode: trip.supplierCode,
    tripId: trip.tripId,
    journeyDate,
    selectedSeats: ["L1"],
    boardingPointId: "BP1",
    droppingPointId: "DP1",
    passengers: [
      {
        seatNumber: "L1",
        firstName: "Asha",
        lastName: "Rao",
        age: 31,
        gender: "FEMALE",
        phone: "+919000000001",
        email: "asha@test.invalid",
      },
    ],
    ...overrides,
  };
}
