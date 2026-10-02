# SRDV Bus API v9 — integration contract

Working record of the SRDV v9 contract as actually supplied. Chat pastes of the
full Postman export have truncated at 50,000 characters three times, each time
cutting off inside the Search response, so this file is the durable copy.

**Rule for this file:** only write down what SRDV documented. A field that is
not here has not been supplied, and the adapter must not invent it.

Status legend — **Confirmed**: full request _and_ response supplied.
**Partial**: request shape stated, response never supplied. **Missing**: nothing.

| Endpoint                  | Status    | Implemented |
| ------------------------- | --------- | ----------- |
| `Search`                  | Confirmed | ✅ yes      |
| `GetSeatLayOut`           | Confirmed | ✅ yes      |
| `GetBoardingPointDetails` | Confirmed | ✅ yes      |
| `Block`                   | Confirmed | ✅ yes      |
| `Book`                    | Confirmed | ✅ yes      |
| `Balance`                 | Confirmed | ✅ yes      |
| `BalanceLog`              | Confirmed | ✅ yes      |
| `GetBookingDetails`       | Missing   | ❌ blocked  |
| `Cancel`                  | Confirmed | ✅ yes      |
| Ticket retrieval          | Missing   | ❌ blocked  |

## Authentication

Credentials come from the DSA Portal: `Api-Token`, `ClientId`, `UserName`,
`Password`, `EndUserIp`. The calling public IP must be whitelisted in the DSA
portal (production egress is the AWS Elastic IP).

- `Api-Token` is sent as a **request header**.
- `ClientId` / `UserName` / `Password` appear in the **request body** of the
  documented endpoints.
- `Content-Type: application/json`.

Observed against `api.srdvtest.com`: a bad token returns **HTTP 200** with
`Error.ErrorCode: 2008` ("Invalid API Token"). Failures therefore arrive inside
a 200 body, and `ErrorCode != 0` must be treated as an error regardless of HTTP
status. Routing happens _after_ token validation — every path under `/bus/`
answers identically until a valid token is presented.

## Base URL

Unresolved, and deliberately configurable rather than guessed. The Postman
collection calls `{{BusBaseUrl}}v9/rest/Search`, which implies
`BusBaseUrl = https://api.srdvtest.com/bus/`; the integration notes give the
base as `https://api.srdvtest.com/bus/v9/`, which would double the `v9`.

Resolved by `SRDV_API_URL` + `SRDV_REST_PATH_PREFIX`:

| `SRDV_API_URL`                    | `SRDV_REST_PATH_PREFIX` | Result                |
| --------------------------------- | ----------------------- | --------------------- |
| `https://api.srdvtest.com/bus`    | `v9/rest`               | `/bus/v9/rest/Search` |
| `https://api.srdvtest.com/bus/v9` | `rest`                  | `/bus/v9/rest/Search` |

One call with a valid token settles which base is live.

## Search — Confirmed, implemented

`POST {{BusBaseUrl}}v9/rest/Search`, header `Api-Token`.

```json
{
  "ClientId": "{{ClientId}}",
  "UserName": "{{UserName}}",
  "Password": "{{Password}}",
  "FromCityCode": "19402",
  "ToCityCode": "8875",
  "DepartDate": "2025-07-30"
}
```

Cities are addressed by **numeric code**, not name. No city-list endpoint has
been supplied, so the mapping lives in `SRDV_CITY_CODES`. The codes in the
example above must not be taken to denote any particular city — an example
pairing is not a documented mapping.

Response envelope: `Error { ErrorCode, ErrorMessage }`, `TraceId`, `Result[]`.

Each `Result[]` entry carries: `SrdvIndex`, `ResultIndex`, `DepartureTime`,
`ArrivalTime`, `Duration`, `IsArrivingNextDay`, `AvailableSeats`,
`MaxSeatsPerTicket`, `RouteId`, `BusRoute`, `BusType`, `OperatorId`,
`TravelsName`, `Seater`, `Sleeper`, `MTicketEnabled`, `IdProofRequired`,
`IsDropPointMandatory`, `IsAC`, `LiveTracking`, `OTGEnabled`, `VaccinatedBus`,
`VaccinatedStaff`, `BoardingPoints[]`, `DroppingPoints[]`, `DisplayFare`,
`Price[]`, `PartialCancellationAllowed`, `CancellationPolicies[]`.

`BoardingPoints[]` / `DroppingPoints[]`: `Id`, `Name`, `Address`, `Location`,
`Landmark`, `ContactNumber`, `Time`, `IsPrime`. No coordinates.

`Price[]`: `CurrencyCode`, `BaseFare`, `Tax`, `OtherCharges`, `Discount`,
`PublishedFare`, `OfferedFare`, `AgentCommission`, `MarkUp`,
`GstTaxableAmount`, `GstRate`, `GstAmount`. A row may carry several fare
classes. `PublishedFare` is what the customer pays; `OfferedFare` is net of
agent commission and is a cost price — never display it.

`CancellationPolicies[]`: `CancellationCharge`, `CancellationChargeType`
(`Percentage` | `Fixed`), `PolicyString`, `TimeBeforeDept` (`-1` = any time
before the earlier slabs), `FromDate`.

### Notes that cost real debugging

- Booleans arrive as the **strings** `"true"` / `"false"`; numbers as strings.
- Timestamps have **no offset** (`"2025-07-30T18:00:00"`) and are **IST** — the
  API's own `PolicyString` labels that same instant `IST`. Parsing with
  `new Date()` follows the server zone and is 5h30m wrong on a UTC container.
- `AvailableSeats` is free seats only. Total capacity is **not** in Search.
- No ratings, review counts, images or coordinates are returned.

## GetSeatLayOut — Confirmed, implemented

`POST https://bus.srdvtest.com/v9/rest/GetSeatLayOut`, header `Api-Token`.

```json
{
  "ClientId": "...",
  "UserName": "...",
  "Password": "...",
  "EndUserIp": "1.1.1.1",
  "TraceId": "...",
  "SrdvIndex": "...",
  "ResultIndex": "2000005754600059855"
}
```

`TraceId`, `SrdvIndex` and `ResultIndex` all come from the Search response, so
they are packed into the VNBUS `tripId` (`traceId~srdvIndex~resultIndex~maxSeats`)
and taken back apart here. A tripId from any other supplier is rejected rather
than sent as a partial request.

Response: `Error`, `TraceId`, `SrdvIndex`, `ResultIndex`, `AvailableSeats`,
`PaxIdRequired`, `Result` (lower deck), `ResultUpperSeat` (upper deck, absent on
single-deck buses).

Both decks are a **sparse nested object**, not an array: rows keyed by `RowNo`,
each holding seats keyed by `ColumnNo`, numbered in steps of two. Grid extent
therefore comes from the highest index present, never the seat count.

Seat fields: `ColumnNo`, `RowNo`, `IsLadiesSeat`, `IsMalesSeat`, `IsUpper`,
`SeatName`, `SeatStatus`, `ReservedForSocialDistancing`, `DoubleBirth`,
`SeatType`, `Width`, `Price`, `SeatFare`.

### Notes that cost real debugging

- **`SeatStatus: "true"` means the seat is FREE.** Verified arithmetically
  against the documented sample: 28 seats, 26 with `"true"`, `AvailableSeats`
  `"26"`. Reading it as "occupied" inverts the entire seat map.
- `IsUpper` is a **real boolean**; the sibling flags are strings.
- `Price` here is **not** the Search price shape — GST is `GSTRate` /
  `GSTAmount` (not `GstRate` / `GstAmount`) and markup is `AgentMarkUp` (not
  `MarkUp`). They are separate types for that reason.
- `PublishedFare` is the passenger price. `SeatFare` and `OfferedFare` are net
  of agent commission — cost prices, never shown.
- The response describes seats only. Operator, cities, times, boarding points
  and route come from Search; those fields are left empty here rather than
  invented.
- No window / legroom / emergency-exit attributes are returned.

## GetBoardingPointDetails — Confirmed, implemented

`POST https://bus.srdvtest.com/v9/rest/GetBoardingPointDetails`, header
`Api-Token`.

```json
{
  "ClientId": "...",
  "UserName": "...",
  "Password": "...",
  "TraceId": "...",
  "SrdvIndex": "...",
  "ResultIndex": "2000005754600059855"
}
```

Response: `Error`, `TraceId`, `SrdvIndex`, `ResultIndex`, `BoardingPoints[]`,
`DroppingPoints[]`. Both lists share one point shape: `Id`, `MasterId`, `Name`,
`Location`, `Address`, `Landmark`, `ContactNumber`, `Time`.

One call returns both lists, so `getPointDetails()` exposes them together;
`getBoardingPoints()` / `getDroppingPoints()` each take their half.

### Notes that cost real debugging

- **Not the Search point shape.** This adds `MasterId` and drops `IsPrime`;
  Search does the reverse. Separate types, so neither loses a field.
- **`MasterId`'s role is undocumented.** `id` is mapped from `Id`, the same
  identifier Search returns. **Open question for Block:** whether its
  `BoardingPointId` / `DroppingPointId` expect `Id` or `MasterId`. Confirm
  before implementing Block — sending the wrong one would fail at booking.
- `Time` is IST "HH:mm" with no date. Dropping points roll to the next day when
  earlier than the latest boarding time (a 06:00 drop on a 20:00 departure is
  the next morning); the response's own boarding times supply that anchor.
- No coordinates are returned.

## Block — Confirmed, implemented

`POST https://bus.srdvtest.com/v9/rest/Block`, header `Api-Token`.

Request: `EndUserIp`, `ClientId`, `UserName`, `Password`, `TraceId`,
`SrdvIndex`, `ResultIndex`, `BoardingPointId`, `DroppingPointId`, `RefId`
(number), `Passengers[]`.

`Passengers[]`: `Title`, `FirstName`, `LastName`, `Gender`, `Age`, `Email`,
`PhoneNo`, `LeadPassenger`, `IdNumber`, `IdType`, `Address`, `SeatName`, and
optional `GSTCompany*` / `GSTNumber` fields.

Response: `Error`, `TraceId`, `SrdvIndex`, `ResultIndex`, **`BlockKey`**,
`DepartureTime`, `ArrivalTime`, `Duration`, `IsArrivingNextDay`, `BusType`,
`TravelsName`, `Price { BaseFare }`, `BoardingPointdetails`,
`DroppingPointsDetails`, `CancellationPolicy[]`, `Passengers[]` each with a
`Seat` object.

### Notes that cost real debugging

- **`BoardingPointId` takes the point's `Id`, not `MasterId`** — settled by the
  response echoing the sent `43227` / `24511` back as `Id`, with different
  `MasterId` values (`77419` / `69092`). Previously an open question.
- **`BlockKey` is the handle Book needs.** A response without one means the
  seats are not held; the adapter raises `SUPPLIER_BOOKING_FAILED` rather than
  reporting a successful block.
- **SRDV returns no hold expiry.** `expiresAt` is deliberately empty — a made-up
  deadline would promise a window the supplier never gave, and a shorter real
  one drops the seat mid-payment.
- Top-level `Price.BaseFare` (7) excludes tax. The passenger owes the sum of
  each seat's `PublishedFare` (7.35). `SeatFare` / `OfferedFare` are
  commission-net cost prices.
- Casing is inconsistent and transcribed exactly: `BoardingPointdetails`
  (lowercase d) vs `DroppingPointsDetails`; `CancellationPolicy` singular where
  Search says `CancellationPolicies`; the seat price mixes `GstRate` with
  `GSTAmount`.
- **⚠️ `Gender` is a numeric code and only `"1"` is evidenced** (paired with
  Title "Mr"). Female is mapped to `"2"` by convention, which the supplied
  documentation does NOT confirm. Verify before taking live female bookings.
- `SeatBlockRequest` was extended with optional passenger identity and
  boarding/dropping point ids; SRDV refuses a passenger lacking name, title,
  gender or age, so the adapter validates before sending rather than
  half-forming a booking.

## Book — Confirmed, implemented

`POST https://bus.srdvtest.com/v9/rest/Book`, header `Api-Token`.

```json
{
  "ClientId": "...",
  "UserName": "...",
  "Password": "...",
  "TraceId": "...",
  "SrdvIndex": "...",
  "ResultIndex": "2000005753040081158"
}
```

Response: `Error`, `TraceId`, `SrdvIndex`, `ResultIndex`, `BookingId`,
`Result { BusBookingStatus, TicketNo, TravelOperatorPNR }`.

### Notes that cost real debugging

- **The request carries no `BlockKey`.** Book keys off the same TraceId +
  SrdvIndex + ResultIndex as Block, and SRDV correlates the two itself. Nothing
  beyond the documented six fields is sent. This also means `blockId` alone
  cannot address a booking, so `SupplierConfirmBookingRequest` gained an
  optional `tripId`; without it the adapter refuses before any request goes out.
- **`ErrorCode: 0` does NOT mean a seat was sold.** The outcome is
  `Result.BusBookingStatus`, and only `"Success"` is a booking. Anything else —
  including a missing `Result` — raises `SUPPLIER_BOOKING_FAILED`
  (non-retryable) rather than returning a status a caller might forget to read.
  Contrary to the earlier note, Book does return a body.
- `BookingId` is **numeric**, unlike every other SRDV identifier.
- `TicketNo` and `TravelOperatorPNR` carry the same value in the sample; they
  are mapped to separate fields regardless, since nothing documents them as
  always equal.

## Cancel — Confirmed, implemented

`POST https://bus.srdvtest.com/v9/rest/Cancel`, header `Api-Token`.

```json
{
  "ClientId": "...",
  "UserName": "...",
  "Password": "...",
  "TraceId": "...",
  "SeatName": "X",
  "Remark": "Journey cancelled due to personal reasons"
}
```

Response: `Error`, `Status`, `CancelId` (numeric), `TraceId`.

### Notes that cost real debugging

- **Keyed by `TraceId` + `SeatName`** — not by BookingId or ResultIndex. The
  TraceId comes from the tripId, so `SupplierCancelBookingRequest` gained
  optional `tripId` and `seatName`.
- **One seat per call.** This is what Search's `PartialCancellationAllowed`
  refers to; cancelling a multi-seat booking means one call per seat.
- **`Status: "In Process"` means accepted, not settled.** Mapped to `REQUESTED`
  with a `PENDING` refund, never `CONFIRMED` — telling a customer their refund
  is done before SRDV has settled it is how refunds go missing.
- No penalty figure is returned; it stays zero and the real deduction follows
  from the trip's `CancellationPolicies`.

## Balance / BalanceLog — Confirmed, implemented

`POST .../v9/rest/Balance` and `.../v9/rest/BalanceLog`, both taking only
`EndUserIp`, `ClientId`, `UserName`, `Password`.

- `Balance` -> `Balance`, `CreditLimit`.
- `BalanceLog` -> `Result[]` of `ID`, `Date`, `ClientID`, `ClientName`,
  `Detail`, `Debit`, `Credit`, `Balance`, `Module`, `TraceID`, `RefID`,
  `UpdatedBy`.

Exposed as `getBalance()` / `getBalanceLog()`. `Balance` also backs
`healthCheck()`: it needs no trip context and sells nothing, which makes it a
far better probe than posting an empty Search.

## ⚠️ ErrorCode is typed inconsistently across v9

`Search` / `Block` / `Book` return `"ErrorCode": 0` (**number**).
`Cancel` / `Balance` / `BalanceLog` return `"ErrorCode": "0"` (**string**).

The client originally tested `ErrorCode !== 0`, which is true for the string
`"0"` — so **every successful cancel, balance and balance-log call was being
raised as an error**. The comparison is now numeric. Two tests pin both
spellings, for success and for a non-zero code.

## GetBookingDetails / Ticket — Missing

No endpoint path, request or response supplied. Ticket retrieval may be covered
by GetBookingDetails once that contract arrives.

## How to complete this file

Chat truncates at 50,000 characters and the Search response alone exceeds it.
Append the remaining sections to this file directly instead of pasting — for
each endpoint: exact URL, method, headers, full request body, full response
body, and the error cases. Only the sections marked blocked above are needed;
Search is done.
