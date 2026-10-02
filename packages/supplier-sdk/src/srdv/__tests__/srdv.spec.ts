import { SrdvApiError, SrdvClient } from "../client";
import {
  decodeSrdvTripId,
  encodeSrdvTripId,
  toBusSearchResult,
  toFare,
  toGstBreakdown,
  isSrdvBookingSuccessful,
  toCancellation,
  toConfirmedBooking,
  toPointDetails,
  toSeatBlock,
  toSeatLayout,
  toSrdvGender,
} from "../mappers";
import type {
  SrdvBlockResponse,
  SrdvBookResponse,
  SrdvBoardingPointDetailsResponse,
  SrdvSearchResponse,
  SrdvSearchResult,
  SrdvSeat,
  SrdvSeatLayoutResponse,
} from "../types";

/** Trimmed from the Search response captured in the v9 integration guide. */
const SAMPLE: SrdvSearchResult = {
  SrdvIndex: 39,
  ResultIndex: "2000000153240054664",
  DepartureTime: "2025-07-30T18:00:00",
  ArrivalTime: "2025-07-31T04:00:00",
  Duration: 600,
  IsArrivingNextDay: "false",
  AvailableSeats: "13",
  MaxSeatsPerTicket: "6",
  RouteId: "2000000100000054664",
  BusRoute: "Bangalore-Hyderabad",
  BusType: "Volvo A/C Seater (1+1)",
  OperatorId: "10419079",
  TravelsName: "TESTING ACCOUNT",
  Seater: "true",
  Sleeper: "false",
  MTicketEnabled: "true",
  IdProofRequired: "false",
  IsDropPointMandatory: "false",
  IsAC: "true",
  LiveTracking: "false",
  OTGEnabled: "false",
  VaccinatedBus: "false",
  VaccinatedStaff: "false",
  BoardingPoints: [
    {
      Id: "43227",
      Name: "Domlur",
      Address: "Domlur",
      Location: "Domlur",
      Landmark: "Domlur",
      ContactNumber: "7204587325",
      Time: "18:00",
      IsPrime: "true",
    },
  ],
  DroppingPoints: [
    {
      Id: "24511",
      Name: "Abids",
      Address: "Kukatpalli, testing",
      Location: "Abids",
      Landmark: "kukatpalli,Testing",
      ContactNumber: "99999999999999",
      Time: "04:00",
      IsPrime: "true",
    },
  ],
  DisplayFare: "5.25",
  Price: [
    {
      CurrencyCode: "INR",
      BaseFare: "5.00",
      Tax: "0.25",
      OtherCharges: "0.00",
      Discount: "0",
      PublishedFare: "5.25",
      OfferedFare: 5,
      AgentCommission: 0.25,
      MarkUp: "0",
      GstTaxableAmount: "5.00",
      GstRate: "5",
      GstAmount: "0.25",
    },
  ],
  PartialCancellationAllowed: "true",
  CancellationPolicies: [
    {
      CancellationCharge: "100",
      CancellationChargeType: "Percentage",
      PolicyString:
        "If the cancellation happens between 0 to 12 hours ... the cancellation fee is 100%",
      TimeBeforeDept: "12",
      FromDate: "2025-07-30",
    },
  ],
};

const CONTEXT = {
  sourceCity: "Bangalore",
  destinationCity: "Hyderabad",
  journeyDate: "2025-07-30",
  traceId: "36",
};

describe("SRDV search mapping", () => {
  it("packs every id a later call needs into the trip id", () => {
    // ResultIndex alone cannot address a seat map — GetSeatLayOut also demands
    // TraceId and SrdvIndex, so all three travel together.
    const trip = toBusSearchResult(SAMPLE, CONTEXT);

    expect(trip.tripId).toContain("2000000153240054664");
    expect(decodeSrdvTripId(trip.tripId)?.resultIndex).toBe("2000000153240054664");
    expect(trip.srdv.resultIndex).toBe("2000000153240054664");
    expect(trip.srdv.srdvIndex).toBe(39);
  });

  it("coerces the string-typed numbers SRDV sends", () => {
    const trip = toBusSearchResult(SAMPLE, CONTEXT);

    expect(trip.availableSeats).toBe(13);
    expect(trip.durationMinutes).toBe(600);
    expect(trip.srdv.maxSeatsPerTicket).toBe(6);
    expect(trip.srdv.partialCancellationAllowed).toBe(true);
    expect(trip.liveTracking).toBe(false);
  });

  it("reads GST from the supplier rather than assuming a rate", () => {
    const { baseFare, tax, gstRatePercent } = toGstBreakdown(SAMPLE.Price[0]);

    expect(baseFare.amount).toBe(5);
    expect(tax.amount).toBe(0.25);
    expect(gstRatePercent).toBe(5);
  });

  it("takes DisplayFare as the headline fare", () => {
    expect(toFare(SAMPLE).amount).toBe(5.25);
  });

  it("falls back to the cheapest fare class when DisplayFare is absent", () => {
    const multi: SrdvSearchResult = {
      ...SAMPLE,
      DisplayFare: "",
      Price: [
        { ...SAMPLE.Price[0]!, PublishedFare: "157.50" },
        { ...SAMPLE.Price[0]!, PublishedFare: "105.00" },
      ],
    };

    expect(toFare(multi).amount).toBe(105);
  });

  it("rolls a dropping point past midnight onto the next day", () => {
    // Departs 18:00, drops at 04:00 — the drop is the following morning, not
    // ten hours before the bus leaves.
    const trip = toBusSearchResult(SAMPLE, CONTEXT);
    const board = new Date(trip.boardingPoints[0]!.time).getTime();
    const drop = new Date(trip.droppingPoints[0]!.time).getTime();

    expect(drop).toBeGreaterThan(board);
  });

  it("reports no rating rather than inventing one", () => {
    const trip = toBusSearchResult(SAMPLE, CONTEXT);

    expect(trip.rating).toBe(0);
    expect(trip.reviews.reviewCount).toBe(0);
  });

  it("reads supplier timestamps as IST whatever zone the server runs in", () => {
    // SRDV sends "2025-07-30T18:00:00" with no offset and calls that instant
    // IST in its own CancellationPolicies text, so it is 12:30 UTC. Parsing it
    // with new Date() would instead follow the host zone and land on 18:00Z on
    // the UTC containers we deploy to. These are absolute instants precisely so
    // the assertion fails if that regresses.
    const trip = toBusSearchResult(SAMPLE, CONTEXT);

    expect(trip.departureTime).toBe("2025-07-30T12:30:00.000Z");
    expect(trip.arrivalTime).toBe("2025-07-30T22:30:00.000Z");
    expect(trip.boardingPoints[0]!.time).toBe("2025-07-30T12:30:00.000Z");
    // 04:00 IST the next morning.
    expect(trip.droppingPoints[0]!.time).toBe("2025-07-30T22:30:00.000Z");
  });

  it("leaves total capacity unknown, since Search only reports free seats", () => {
    const trip = toBusSearchResult(SAMPLE, CONTEXT);

    expect(trip.seatLayout.availableSeats).toBe(13);
    // Not 13 — echoing AvailableSeats here would show the bus as entirely empty.
    expect(trip.seatLayout.totalSeats).toBe(0);
  });
});

describe("SrdvClient", () => {
  const credentials = {
    baseUrl: "https://example.test/",
    apiToken: "token",
    clientId: "client",
    userName: "user",
    password: "pass",
    endUserIp: "1.2.3.4",
  };

  it("sends the token header and repeats credentials in the body", async () => {
    let captured: { url: string; init: RequestInit } | null = null;
    const fetchImpl = ((url: string, init: RequestInit) => {
      captured = { url, init };
      return Promise.resolve(
        new Response(JSON.stringify({ Error: { ErrorCode: 0, ErrorMessage: "" }, Result: [] }), {
          status: 200,
        }),
      );
    }) as unknown as typeof fetch;

    const client = new SrdvClient({ credentials, fetchImpl });
    await client.post<SrdvSearchResponse>("Search", "v9/rest/Search", { FromCityCode: "1" });

    expect(captured!.url).toBe("https://example.test/v9/rest/Search");
    const headers = captured!.init.headers as Record<string, string>;
    expect(headers["Api-Token"]).toBe("token");
    const body = JSON.parse(captured!.init.body as string) as Record<string, unknown>;
    expect(body).toMatchObject({
      ClientId: "client",
      UserName: "user",
      Password: "pass",
      EndUserIp: "1.2.3.4",
      FromCityCode: "1",
    });
  });

  it("treats a non-zero ErrorCode in a 200 body as a failure", async () => {
    const fetchImpl = (() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ Error: { ErrorCode: 6, ErrorMessage: "Invalid credentials" } }),
          {
            status: 200,
          },
        ),
      )) as unknown as typeof fetch;

    const client = new SrdvClient({ credentials, fetchImpl });

    await expect(client.post<SrdvSearchResponse>("Search", "v9/rest/Search", {})).rejects.toThrow(
      SrdvApiError,
    );
  });
});

/** Trimmed from the documented GetSeatLayOut response. */
function seat(overrides: Partial<SrdvSeat> & { SeatName: string }): SrdvSeat {
  return {
    ColumnNo: 0,
    RowNo: 0,
    IsLadiesSeat: "false",
    IsMalesSeat: "false",
    IsUpper: false,
    SeatStatus: "true",
    ReservedForSocialDistancing: "false",
    DoubleBirth: "false",
    SeatType: "Horizontal Sleeper",
    Width: "1",
    Price: {
      CurrencyCode: "INR",
      BaseFare: "13.00",
      Tax: "0.65",
      Discount: 0,
      PublishedFare: "13.65",
      OfferedFare: 13,
      AgentCommission: 0.65,
      AgentMarkUp: 0,
      GstTaxableAmount: "13.00",
      GSTRate: "5",
      GSTAmount: "0.65",
    },
    SeatFare: 13,
    ...overrides,
  };
}

const SEAT_LAYOUT: SrdvSeatLayoutResponse = {
  Error: { ErrorCode: 0, ErrorMessage: "" },
  TraceId: "36",
  SrdvIndex: "39",
  ResultIndex: "2000005754600059855",
  AvailableSeats: "3",
  PaxIdRequired: "No",
  Result: {
    "0": {
      "0": seat({ SeatName: "1", ColumnNo: 0, RowNo: 0 }),
      "2": seat({ SeatName: "2", ColumnNo: 2, RowNo: 0, SeatStatus: "false" }),
    },
    "2": {
      "0": seat({ SeatName: "8", ColumnNo: 0, RowNo: 2, IsLadiesSeat: "true" }),
    },
  },
  ResultUpperSeat: {
    "0": { "0": seat({ SeatName: "a", ColumnNo: 0, RowNo: 0, IsUpper: true }) },
  },
};

const LAYOUT_CONTEXT = {
  supplierCode: "SRDV",
  tripId: "36~39~2000005754600059855~6",
  journeyDate: "2025-07-30",
  maxSelectableSeats: 6,
};

describe("SRDV trip id", () => {
  it("round-trips the ids every follow-up call needs", () => {
    const ref = {
      traceId: "36",
      srdvIndex: "39",
      resultIndex: "2000005754600059855",
      maxSeatsPerTicket: 6,
    };

    expect(decodeSrdvTripId(encodeSrdvTripId(ref))).toEqual(ref);
  });

  it("rejects a trip id that is not SRDV's", () => {
    expect(decodeSrdvTripId("2000005754600059855")).toBeNull();
    expect(decodeSrdvTripId("mock-route-001-3")).toBeNull();
  });

  it("carries the trace id out of search, since seat layout cannot be called without it", () => {
    const trip = toBusSearchResult(SAMPLE, CONTEXT);

    expect(decodeSrdvTripId(trip.tripId)).toEqual({
      traceId: "36",
      srdvIndex: "39",
      resultIndex: SAMPLE.ResultIndex,
      maxSeatsPerTicket: 6,
    });
  });
});

describe("SRDV seat layout mapping", () => {
  it("reads SeatStatus 'true' as available, not occupied", () => {
    // Inverting this would offer every booked seat and hide every free one.
    const layout = toSeatLayout(SEAT_LAYOUT, LAYOUT_CONTEXT);
    const all = layout.decks.flatMap((deck) => deck.seats);

    expect(all.find((s) => s.seatNumber === "1")?.status).toBe("AVAILABLE");
    expect(all.find((s) => s.seatNumber === "2")?.status).toBe("BOOKED");
  });

  it("splits lower and upper decks", () => {
    const layout = toSeatLayout(SEAT_LAYOUT, LAYOUT_CONTEXT);

    expect(layout.decks.map((deck) => deck.deck)).toEqual(["LOWER", "UPPER"]);
    expect(layout.decks[0]!.seats).toHaveLength(3);
    expect(layout.decks[1]!.seats).toHaveLength(1);
  });

  it("charges the gross published fare, never the commission-net seat fare", () => {
    // PublishedFare 13.65 is the passenger price; SeatFare/OfferedFare 13 is
    // what we pay. Showing 13 would undercharge on every seat.
    const layout = toSeatLayout(SEAT_LAYOUT, LAYOUT_CONTEXT);

    expect(layout.decks[0]!.seats[0]!.fare).toEqual({ amount: 13.65, currency: "INR" });
  });

  it("surfaces a ladies seat as both status and restriction", () => {
    const layout = toSeatLayout(SEAT_LAYOUT, LAYOUT_CONTEXT);
    const ladies = layout.decks[0]!.seats.find((s) => s.seatNumber === "8");

    expect(ladies?.status).toBe("LADIES");
    expect(ladies?.genderRestriction).toBe("LADIES");
  });

  it("measures the sparse grid by its highest index, not its seat count", () => {
    // SRDV numbers rows/columns in steps of two, so 3 lower seats span
    // rows 0..2 and columns 0..2.
    const layout = toSeatLayout(SEAT_LAYOUT, LAYOUT_CONTEXT);

    expect(layout.decks[0]!.rows).toBe(3);
    expect(layout.decks[0]!.columns).toBe(3);
  });

  it("omits the upper deck entirely for a single-deck bus", () => {
    const { ResultUpperSeat: _upper, ...singleDeck } = SEAT_LAYOUT;
    const layout = toSeatLayout(singleDeck, LAYOUT_CONTEXT);

    expect(layout.decks.map((deck) => deck.deck)).toEqual(["LOWER"]);
  });
});

/** Verbatim from the documented GetBoardingPointDetails response. */
const POINT_DETAILS: SrdvBoardingPointDetailsResponse = {
  Error: { ErrorCode: 0, ErrorMessage: "" },
  TraceId: "36",
  SrdvIndex: "39",
  ResultIndex: "2000005754600059855",
  BoardingPoints: [
    {
      Id: "24511",
      MasterId: "69092",
      Name: "Abids",
      Location: "Abids",
      Address: "Kukatpalli, testing",
      Landmark: "kukatpalli,Testing",
      ContactNumber: "99999999999999",
      Time: "20:00",
    },
  ],
  DroppingPoints: [
    {
      Id: "27176",
      MasterId: "66038",
      Name: "Koramangala",
      Location: "Koramangala",
      Address: "sa",
      Landmark: "ASD",
      ContactNumber: "1234567890",
      Time: "06:00",
    },
  ],
};

describe("SRDV boarding point details mapping", () => {
  it("maps both lists, keeping the landmark VNBUS points carry", () => {
    const { boardingPoints, droppingPoints } = toPointDetails(POINT_DETAILS, "2025-07-30");

    expect(boardingPoints).toHaveLength(1);
    expect(droppingPoints).toHaveLength(1);
    expect(boardingPoints[0]!.id).toBe("24511");
    expect(boardingPoints[0]!.name).toBe("Abids");
    expect(boardingPoints[0]!.city).toBe("Abids");
    expect(boardingPoints[0]!.landmark).toBe("kukatpalli,Testing");
  });

  it("reads point times as IST whatever zone the server runs in", () => {
    // 20:00 IST on the journey date is 14:30 UTC.
    const { boardingPoints } = toPointDetails(POINT_DETAILS, "2025-07-30");

    expect(boardingPoints[0]!.time).toBe("2025-07-30T14:30:00.000Z");
  });

  it("rolls an overnight drop onto the next day", () => {
    // Boards 20:00, drops 06:00 — the morning after, not 14 hours before.
    const { boardingPoints, droppingPoints } = toPointDetails(POINT_DETAILS, "2025-07-30");

    expect(droppingPoints[0]!.time).toBe("2025-07-31T00:30:00.000Z");
    expect(Date.parse(droppingPoints[0]!.time)).toBeGreaterThan(
      Date.parse(boardingPoints[0]!.time),
    );
  });

  it("survives a response carrying neither list", () => {
    const empty = toPointDetails({ Error: { ErrorCode: 0, ErrorMessage: "" } }, "2025-07-30");

    expect(empty.boardingPoints).toEqual([]);
    expect(empty.droppingPoints).toEqual([]);
  });
});

/** Verbatim from the documented Block response. */
const BLOCK_RESPONSE: SrdvBlockResponse = {
  Error: { ErrorCode: 0, ErrorMessage: "" },
  TraceId: "36",
  SrdvIndex: "39",
  ResultIndex: "2000000154610015841",
  BlockKey: "EUlWXcYAYc",
  Price: { BaseFare: 7 },
  Passengers: [
    {
      LeadPassenger: "true",
      Title: "Mr",
      FirstName: "Joe",
      LastName: "Smith",
      Age: "25",
      Gender: "1",
      PhoneNo: "999999999",
      Seat: {
        ColumnNo: "0",
        RowNo: "2",
        IsLadiesSeat: "false",
        IsMalesSeat: "false",
        IsUpper: false,
        SeatFare: "7.35",
        SeatIndex: "11",
        SeatName: "11",
        SeatStatus: "true",
        SeatType: "Horizontal Sleeper",
        Width: "1",
        Price: {
          CurrencyCode: "INR",
          BaseFare: "7.00",
          Tax: "0.35",
          PublishedFare: "7.35",
          OfferedFare: "7.35",
          GstTaxableAmount: "7.00",
          GstRate: "5",
          GSTAmount: "0.35",
        },
      },
    },
  ],
};

describe("SRDV block mapping", () => {
  it("returns the BlockKey as the block id", () => {
    expect(toSeatBlock(BLOCK_RESPONSE).blockId).toBe("EUlWXcYAYc");
  });

  it("charges the gross published fare, not the top-level base fare", () => {
    // Price.BaseFare is 7 and excludes tax; the passenger owes 7.35.
    expect(toSeatBlock(BLOCK_RESPONSE).fare).toEqual({ amount: 7.35, currency: "INR" });
  });

  it("sums the fare across passengers", () => {
    const two = {
      ...BLOCK_RESPONSE,
      Passengers: [...BLOCK_RESPONSE.Passengers!, ...BLOCK_RESPONSE.Passengers!],
    };

    expect(toSeatBlock(two).fare.amount).toBeCloseTo(14.7, 5);
  });

  it("claims no hold deadline, because SRDV states none", () => {
    // Inventing one would promise the customer a window SRDV never gave.
    expect(toSeatBlock(BLOCK_RESPONSE).expiresAt).toBe("");
  });

  it("maps male to the documented gender code", () => {
    // "1" is the only code the documentation evidences (Title "Mr").
    expect(toSrdvGender("MALE")).toBe("1");
  });
});

/** Verbatim from the documented Book response. */
const BOOK_RESPONSE: SrdvBookResponse = {
  Error: { ErrorCode: 0, ErrorMessage: "" },
  TraceId: "36",
  SrdvIndex: "39",
  ResultIndex: "2000000154610015841",
  BookingId: 812,
  Result: {
    BusBookingStatus: "Success",
    TicketNo: "DAJZD7BC",
    TravelOperatorPNR: "DAJZD7BC",
  },
};

describe("SRDV book mapping", () => {
  it("maps the ticket, PNR and booking id", () => {
    const booking = toConfirmedBooking(BOOK_RESPONSE);

    // BookingId is numeric here, unlike every other SRDV identifier.
    expect(booking.supplierBookingId).toBe("812");
    expect(booking.ticketNumber).toBe("DAJZD7BC");
    expect(booking.pnr).toBe("DAJZD7BC");
    expect(booking.status).toBe("CONFIRMED");
  });

  it("treats a non-Success status as a failed booking even on ErrorCode 0", () => {
    // The money-critical case: the envelope reports no error, yet no seat was
    // sold. Reading only ErrorCode would confirm a booking that does not exist.
    const failed = {
      ...BOOK_RESPONSE,
      Result: { ...BOOK_RESPONSE.Result, BusBookingStatus: "Failed" },
    };

    expect(isSrdvBookingSuccessful(failed)).toBe(false);
    expect(toConfirmedBooking(failed).status).toBe("FAILED");
  });

  it("treats a missing Result as a failed booking", () => {
    const empty: SrdvBookResponse = { Error: { ErrorCode: 0, ErrorMessage: "" } };

    expect(isSrdvBookingSuccessful(empty)).toBe(false);
    expect(toConfirmedBooking(empty).status).toBe("FAILED");
  });
});

describe("SRDV cancel mapping", () => {
  const CTX = { bookingId: "VN-1", supplierBookingId: "812" };

  it("treats 'In Process' as requested, never confirmed", () => {
    // SRDV has accepted the request, not settled it. Reporting CONFIRMED here
    // would tell a customer their refund is done before SRDV has agreed to it.
    const cancellation = toCancellation(
      { Error: { ErrorCode: "0", ErrorMessage: "" }, Status: "In Process", CancelId: 48 },
      CTX,
    );

    expect(cancellation.status).toBe("REQUESTED");
    expect(cancellation.refundStatus).toBe("PENDING");
  });

  it("claims no penalty, because Cancel reports none", () => {
    const cancellation = toCancellation({ Status: "In Process" }, CTX);

    expect(cancellation.penalty).toEqual({ amount: 0, currency: "INR" });
  });

  it("reports an unrecognised status as failed", () => {
    expect(toCancellation({ Status: "Rejected" }, CTX).status).toBe("FAILED");
    expect(toCancellation({}, CTX).refundStatus).toBe("NOT_APPLICABLE");
  });
});

describe("SrdvClient error envelope", () => {
  const credentials = {
    baseUrl: "https://bus.srdvtest.com",
    apiToken: "t",
    clientId: "c",
    userName: "u",
    password: "p",
    endUserIp: "1.1.1.1",
  };

  function clientReturning(body: unknown): SrdvClient {
    return new SrdvClient({
      credentials,
      fetchImpl: (() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(body),
        })) as unknown as typeof fetch,
    });
  }

  it('accepts the string "0" that Cancel and Balance send', async () => {
    // Search/Block/Book send the number 0; Cancel/Balance/BalanceLog send "0".
    // A strict !== 0 rejected every successful cancel as an error.
    await expect(
      clientReturning({ Error: { ErrorCode: "0", ErrorMessage: "" }, Status: "In Process" }).post(
        "Cancel",
        "v9/rest/Cancel",
        {},
      ),
    ).resolves.toMatchObject({ Status: "In Process" });
  });

  it("still rejects a non-zero code in either spelling", async () => {
    await expect(
      clientReturning({ Error: { ErrorCode: "2008", ErrorMessage: "Invalid API Token" } }).post(
        "Cancel",
        "v9/rest/Cancel",
        {},
      ),
    ).rejects.toThrow("Invalid API Token");

    await expect(
      clientReturning({ Error: { ErrorCode: 2008, ErrorMessage: "Invalid API Token" } }).post(
        "Search",
        "v9/rest/Search",
        {},
      ),
    ).rejects.toThrow("Invalid API Token");
  });
});
