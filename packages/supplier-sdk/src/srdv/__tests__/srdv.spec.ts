import { SrdvApiError, SrdvClient } from "../client";
import { toBusSearchResult, toFare, toGstBreakdown } from "../mappers";
import type { SrdvSearchResponse, SrdvSearchResult } from "../types";

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
};

describe("SRDV search mapping", () => {
  it("uses ResultIndex as the trip id, since later calls key off it", () => {
    const trip = toBusSearchResult(SAMPLE, CONTEXT);

    expect(trip.tripId).toBe("2000000153240054664");
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
