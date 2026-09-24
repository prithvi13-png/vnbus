import { Injectable } from "@nestjs/common";
import type {
  SeatGenderRestriction,
  SeatHoldResponse,
  SeatLayoutAdminConfig,
  SeatLayoutDetails,
  SeatMapSeat,
  SeatStatus,
  UpdateSeatLayoutAdminConfigRequest,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "seat",
  boundedContext: "Seat inventory and layout",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Seat map normalization",
      description: "Represent decks, rows, columns, and fare per seat.",
    },
    {
      name: "Seat blocking",
      description: "Prepare lock expiry and release semantics.",
    },
    {
      name: "Seat hold timer",
      description: "Hold selected seats for ten minutes before automatic expiry.",
    },
    {
      name: "Availability checks",
      description: "Model seat availability without supplier-specific leakage.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class SeatRepository {
  private readonly holds = new Map<string, SeatHoldResponse>();
  private layoutConfiguration: SeatLayoutAdminConfig = defaultLayoutConfiguration();

  findSummary(): ModuleSummary {
    return summary;
  }

  saveHold(hold: SeatHoldResponse): SeatHoldResponse {
    this.holds.set(hold.reservationId, hold);

    return hold;
  }

  findHold(reservationId: string): SeatHoldResponse | null {
    const hold = this.holds.get(reservationId);
    if (!hold) {
      return null;
    }
    if (Date.parse(hold.expiresAt) <= Date.now()) {
      this.holds.delete(reservationId);

      return {
        ...hold,
        status: "EXPIRED",
      };
    }

    return hold;
  }

  releaseHold(reservationId: string): void {
    this.holds.delete(reservationId);
  }

  getLayoutConfiguration(): SeatLayoutAdminConfig {
    return cloneLayoutConfiguration(this.layoutConfiguration);
  }

  updateLayoutConfiguration(input: UpdateSeatLayoutAdminConfigRequest): SeatLayoutAdminConfig {
    this.layoutConfiguration = {
      ...this.layoutConfiguration,
      ...copyDefined(input, [
        "layoutName",
        "baseFareAmount",
        "windowPremiumAmount",
        "extraLegroomPremiumAmount",
        "sleeperPremiumAmount",
        "upperDeckPremiumAmount",
        "lowerDeckEnabled",
        "upperDeckEnabled",
        "maxSelectableSeats",
        "updatedBy",
      ]),
      maleSeatNumbers: normalizeSeatNumbers(
        input.maleSeatNumbers ?? this.layoutConfiguration.maleSeatNumbers,
      ),
      femaleSeatNumbers: normalizeSeatNumbers(
        input.femaleSeatNumbers ?? this.layoutConfiguration.femaleSeatNumbers,
      ),
      femaleBookedSeatNumbers: normalizeSeatNumbers(
        input.femaleBookedSeatNumbers ?? this.layoutConfiguration.femaleBookedSeatNumbers,
      ),
      bookedSeatNumbers: normalizeSeatNumbers(
        input.bookedSeatNumbers ?? this.layoutConfiguration.bookedSeatNumbers,
      ),
      blockedSeatNumbers: normalizeSeatNumbers(
        input.blockedSeatNumbers ?? this.layoutConfiguration.blockedSeatNumbers,
      ),
      updatedAt: new Date().toISOString(),
    };

    return this.getLayoutConfiguration();
  }

  applyLayoutConfiguration(layout: SeatLayoutDetails): SeatLayoutDetails {
    const config = this.layoutConfiguration;
    const activeDecks = layout.decks
      .filter((deck) => (deck.deck === "LOWER" ? config.lowerDeckEnabled : config.upperDeckEnabled))
      .map((deck) => ({
        ...deck,
        seats: deck.seats.map((seat) => applySeatConfiguration(seat, config)),
      }));

    return {
      ...layout,
      maxSelectableSeats: config.maxSelectableSeats,
      decks: activeDecks,
    };
  }
}

function defaultLayoutConfiguration(): SeatLayoutAdminConfig {
  return {
    layoutName: "2+1 Sleeper Price Layout",
    currency: "INR",
    baseFareAmount: 1429,
    windowPremiumAmount: 250,
    extraLegroomPremiumAmount: 130,
    sleeperPremiumAmount: 0,
    upperDeckPremiumAmount: 0,
    lowerDeckEnabled: true,
    upperDeckEnabled: true,
    maxSelectableSeats: 6,
    maleSeatNumbers: ["L1D", "L2D", "U1D", "U2D"],
    femaleSeatNumbers: ["L2B", "U1B", "U3B"],
    femaleBookedSeatNumbers: ["L4B", "U2B", "U3D"],
    bookedSeatNumbers: ["L1A", "L3D", "L5A", "U1A", "U2A", "U5D"],
    blockedSeatNumbers: ["L3A", "U4D"],
    updatedAt: "2026-08-25T00:00:00.000Z",
    updatedBy: "System",
  };
}

function applySeatConfiguration(seat: SeatMapSeat, config: SeatLayoutAdminConfig): SeatMapSeat {
  const seatNumber = normalizeSeatNumber(seat.seatNumber);
  const femaleBooked = config.femaleBookedSeatNumbers.includes(seatNumber);
  const booked = femaleBooked || config.bookedSeatNumbers.includes(seatNumber);
  const blocked = config.blockedSeatNumbers.includes(seatNumber);
  const female = femaleBooked || config.femaleSeatNumbers.includes(seatNumber);
  const male = !female && config.maleSeatNumbers.includes(seatNumber);

  return {
    ...seat,
    status: resolveSeatStatus(seat.status, { blocked, booked, female }),
    fare: {
      amount: calculateSeatAmount(seat, config),
      currency: config.currency,
    },
    genderRestriction: resolveGenderRestriction(seat.genderRestriction, { female, male }),
  };
}

function calculateSeatAmount(seat: SeatMapSeat, config: SeatLayoutAdminConfig): number {
  return (
    config.baseFareAmount +
    (seat.isWindow ? config.windowPremiumAmount : 0) +
    (seat.hasExtraLegroom ? config.extraLegroomPremiumAmount : 0) +
    (seat.kind === "SLEEPER" ? config.sleeperPremiumAmount : 0) +
    (seat.deck === "UPPER" ? config.upperDeckPremiumAmount : 0)
  );
}

function resolveSeatStatus(
  original: SeatStatus,
  flags: { blocked: boolean; booked: boolean; female: boolean },
): SeatStatus {
  if (flags.booked) {
    return "BOOKED";
  }

  if (flags.blocked) {
    return "BLOCKED";
  }

  if (original === "BOOKED" || original === "BLOCKED" || original === "RESERVED") {
    return original;
  }

  if (flags.female) {
    return "LADIES";
  }

  return original;
}

function resolveGenderRestriction(
  original: SeatGenderRestriction | null,
  flags: { female: boolean; male: boolean },
): SeatGenderRestriction | null {
  if (flags.female) {
    return "LADIES";
  }

  if (flags.male) {
    return "MALE";
  }

  return original;
}

function normalizeSeatNumbers(seatNumbers: string[]): string[] {
  return [...new Set(seatNumbers.map(normalizeSeatNumber).filter(Boolean))].sort();
}

function normalizeSeatNumber(seatNumber: string): string {
  return seatNumber.trim().toUpperCase();
}

function cloneLayoutConfiguration(config: SeatLayoutAdminConfig): SeatLayoutAdminConfig {
  return {
    ...config,
    maleSeatNumbers: [...config.maleSeatNumbers],
    femaleSeatNumbers: [...config.femaleSeatNumbers],
    femaleBookedSeatNumbers: [...config.femaleBookedSeatNumbers],
    bookedSeatNumbers: [...config.bookedSeatNumbers],
    blockedSeatNumbers: [...config.blockedSeatNumbers],
  };
}

function copyDefined<T extends object, K extends keyof T>(source: T, keys: K[]): Pick<T, K> {
  return keys.reduce<Partial<Pick<T, K>>>((accumulator, key) => {
    if (source[key] !== undefined) {
      accumulator[key] = source[key];
    }

    return accumulator;
  }, {}) as Pick<T, K>;
}
