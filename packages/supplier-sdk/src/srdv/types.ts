/**
 * Wire types for SRDV Technologies Bus API v9, transcribed from the integration
 * guide and a captured Search response.
 *
 * Numbers arrive as strings throughout ("AvailableSeats": "13", "BaseFare":
 * "5.00"), and booleans as the strings "true"/"false". Nothing here coerces —
 * the mappers do that, so the wire shape stays an honest record of what the
 * supplier actually sends.
 */

export interface SrdvError {
  /**
   * Number on Search/Block/Book, but the STRING "0" on Cancel/Balance/
   * BalanceLog. Compared numerically everywhere, or a successful cancel reads
   * as a failure.
   */
  ErrorCode: number | string;
  ErrorMessage: string;
}

export interface SrdvPoint {
  Id: string;
  Name: string;
  Address: string;
  Location: string;
  Landmark: string;
  ContactNumber: string;
  /** "18:00" — time of day only, no date. */
  Time: string;
  IsPrime: string;
}

export interface SrdvPrice {
  CurrencyCode: string;
  BaseFare: string;
  Tax: string;
  OtherCharges: string;
  Discount: string;
  PublishedFare: string;
  OfferedFare: number;
  AgentCommission: number;
  MarkUp: string;
  GstTaxableAmount: string;
  GstRate: string;
  GstAmount: string;
}

export interface SrdvCancellationPolicy {
  CancellationCharge: string;
  /** Documented values are "Percentage" and "Fixed"; typed loosely so an
   * unfamiliar value from the supplier does not break parsing. */
  CancellationChargeType: string;
  PolicyString: string;
  /** Hours before departure the band applies to; "-1" means "anytime before". */
  TimeBeforeDept: string;
  FromDate: string;
}

export interface SrdvSearchResult {
  /** Identifies which upstream supplier served the row; required on later calls. */
  SrdvIndex: number;
  /** The trip handle for SeatLayout/Block/Book. */
  ResultIndex: string;
  DepartureTime: string;
  ArrivalTime: string;
  Duration: number;
  IsArrivingNextDay: string;
  AvailableSeats: string;
  MaxSeatsPerTicket: string;
  RouteId: string;
  BusRoute: string;
  BusType: string;
  OperatorId: string;
  TravelsName: string;
  Seater: string;
  Sleeper: string;
  MTicketEnabled: string;
  IdProofRequired: string;
  IsDropPointMandatory: string;
  IsAC: string;
  LiveTracking: string;
  OTGEnabled: string;
  VaccinatedBus: string;
  VaccinatedStaff: string;
  BoardingPoints: SrdvPoint[];
  DroppingPoints: SrdvPoint[];
  DisplayFare: string;
  Price: SrdvPrice[];
  PartialCancellationAllowed: string;
  CancellationPolicies: SrdvCancellationPolicy[];
}

export interface SrdvSearchResponse {
  Error: SrdvError;
  TraceId: number;
  Result: SrdvSearchResult[];
}

export interface SrdvSearchRequest {
  ClientId: string;
  UserName: string;
  Password: string;
  FromCityCode: string;
  ToCityCode: string;
  /** "YYYY-MM-DD". */
  DepartDate: string;
}

export interface SrdvCredentials {
  baseUrl: string;
  apiToken: string;
  clientId: string;
  userName: string;
  password: string;
  /** SRDV ties calls to a whitelisted public IP. */
  endUserIp: string;
}

/**
 * GetSeatLayOut.
 *
 * Price here is NOT the Search row's price shape: GST is spelled GSTRate /
 * GSTAmount rather than GstRate / GstAmount, and markup is AgentMarkUp rather
 * than MarkUp. Kept as its own type so the two never get conflated.
 */
export interface SrdvSeatPrice {
  CurrencyCode: string;
  BaseFare: string;
  Tax: string;
  Discount: number;
  PublishedFare: string;
  OfferedFare: number;
  AgentCommission: number;
  AgentMarkUp: number;
  GstTaxableAmount: string;
  GSTRate: string;
  GSTAmount: string;
}

export interface SrdvSeat {
  ColumnNo: number;
  RowNo: number;
  IsLadiesSeat: string;
  IsMalesSeat: string;
  /** Genuinely boolean here, unlike the sibling string flags. */
  IsUpper: boolean;
  SeatName: string;
  /** "true" means the seat is FREE — verified against AvailableSeats. */
  SeatStatus: string;
  ReservedForSocialDistancing: string;
  DoubleBirth: string;
  SeatType: string;
  Width: string;
  Price: SrdvSeatPrice;
  SeatFare: number;
}

/** Rows keyed by RowNo, each holding seats keyed by ColumnNo. Both are sparse. */
export type SrdvSeatGrid = Record<string, Record<string, SrdvSeat>>;

export interface SrdvSeatLayoutRequest {
  ClientId: string;
  UserName: string;
  Password: string;
  EndUserIp: string;
  TraceId: string;
  SrdvIndex: string;
  ResultIndex: string;
}

export interface SrdvSeatLayoutResponse {
  Error?: SrdvError;
  TraceId?: string;
  SrdvIndex?: string;
  ResultIndex?: string;
  AvailableSeats?: string;
  PaxIdRequired?: string;
  /** Lower deck. */
  Result?: SrdvSeatGrid;
  /** Upper deck; absent on single-deck buses. */
  ResultUpperSeat?: SrdvSeatGrid;
}

/**
 * GetBoardingPointDetails.
 *
 * Not the same point shape as Search: this carries MasterId and drops IsPrime,
 * where Search does the reverse. Kept separate so neither loses a field.
 */
export interface SrdvPointDetail {
  Id: string;
  MasterId: string;
  Name: string;
  Location: string;
  Address: string;
  Landmark: string;
  ContactNumber: string;
  /** Local "HH:mm". */
  Time: string;
}

export interface SrdvBoardingPointDetailsRequest {
  ClientId: string;
  UserName: string;
  Password: string;
  TraceId: string;
  SrdvIndex: string;
  ResultIndex: string;
}

export interface SrdvBoardingPointDetailsResponse {
  Error?: SrdvError;
  TraceId?: string;
  SrdvIndex?: string;
  ResultIndex?: string;
  BoardingPoints?: SrdvPointDetail[];
  DroppingPoints?: SrdvPointDetail[];
}

/**
 * Block.
 *
 * Field casing here is inconsistent with the rest of v9 and with itself —
 * `BoardingPointdetails` (lowercase d) against `DroppingPointsDetails`,
 * `CancellationPolicy` singular where Search says `CancellationPolicies`, and a
 * seat price mixing `GstRate` with `GSTAmount`. Transcribed exactly as sent.
 */
export interface SrdvBlockPassengerRequest {
  Title: string;
  FirstName: string;
  LastName: string;
  /** SRDV's numeric gender code. "1" is male in the documented example. */
  Gender: string;
  Age: string;
  Email?: string;
  PhoneNo: string;
  LeadPassenger: string;
  IdNumber?: string;
  IdType?: string;
  Address?: string;
  SeatName: string;
  GSTCompanyAddress?: string;
  GSTCompanyContactNumber?: string;
  GSTCompanyName?: string;
  GSTNumber?: string;
  GSTCompanyEmail?: string;
}

export interface SrdvBlockRequest {
  EndUserIp: string;
  ClientId: string;
  UserName: string;
  Password: string;
  TraceId: string;
  SrdvIndex: string;
  ResultIndex: string;
  /** Takes the point's `Id` — confirmed by Block echoing it back as `Id`. */
  BoardingPointId: string;
  DroppingPointId: string;
  RefId: number;
  Passengers: SrdvBlockPassengerRequest[];
}

export interface SrdvBlockSeatPrice {
  CurrencyCode: string;
  BaseFare: string;
  Tax: string;
  PublishedFare: string;
  OfferedFare: string;
  GstTaxableAmount: string;
  GstRate: string;
  GSTAmount: string;
}

export interface SrdvBlockSeat {
  ColumnNo: string;
  RowNo: string;
  IsLadiesSeat: string;
  IsMalesSeat: string;
  IsUpper: boolean;
  SeatFare: string;
  SeatIndex: string;
  SeatName: string;
  SeatStatus: string;
  SeatType: string;
  Width: string;
  Price: SrdvBlockSeatPrice;
}

export interface SrdvBlockPassengerResponse {
  LeadPassenger: string;
  Title: string;
  FirstName: string;
  LastName: string;
  Age: string;
  Gender: string;
  IdNumber?: string;
  IdType?: string;
  PhoneNo: string;
  Address?: string;
  Seat: SrdvBlockSeat;
}

export interface SrdvBlockResponse {
  Error?: SrdvError;
  TraceId?: string;
  SrdvIndex?: string;
  ResultIndex?: string;
  /** The handle Book needs. SRDV states no expiry for it. */
  BlockKey?: string;
  DepartureTime?: string;
  ArrivalTime?: string;
  Duration?: number;
  IsArrivingNextDay?: string;
  BusType?: string;
  TravelsName?: string;
  /** Base fare only — the passenger total lives on each seat's PublishedFare. */
  Price?: { BaseFare?: number };
  BoardingPointdetails?: SrdvPointDetail;
  DroppingPointsDetails?: SrdvPointDetail;
  CancellationPolicy?: SrdvCancellationPolicy[];
  Passengers?: SrdvBlockPassengerResponse[];
}

/**
 * Book.
 *
 * The request carries no BlockKey — it keys off the same TraceId + SrdvIndex +
 * ResultIndex as Block, and SRDV correlates the two itself. Nothing beyond the
 * documented six fields is sent.
 */
export interface SrdvBookRequest {
  ClientId: string;
  UserName: string;
  Password: string;
  TraceId: string;
  SrdvIndex: string;
  ResultIndex: string;
}

export interface SrdvBookResult {
  /** "Success" on a completed booking. */
  BusBookingStatus?: string;
  TicketNo?: string;
  TravelOperatorPNR?: string;
}

export interface SrdvBookResponse {
  Error?: SrdvError;
  TraceId?: string;
  SrdvIndex?: string;
  ResultIndex?: string;
  /** Numeric, unlike every other SRDV identifier. */
  BookingId?: number;
  Result?: SrdvBookResult;
}

/** Cancel. Keyed by TraceId + SeatName — not by BookingId or ResultIndex. */
export interface SrdvCancelRequest {
  ClientId: string;
  UserName: string;
  Password: string;
  TraceId: string;
  SeatName: string;
  Remark: string;
}

export interface SrdvCancelResponse {
  Error?: SrdvError;
  /** "In Process" on acceptance — cancellation is asynchronous. */
  Status?: string;
  CancelId?: number;
  TraceId?: string;
}

/** Balance — account credit, useful as a cheap liveness probe. */
export interface SrdvBalanceResponse {
  Error?: SrdvError;
  Balance?: string;
  CreditLimit?: string;
}

export interface SrdvBalanceLogEntry {
  ID?: string;
  Date?: string;
  ClientID?: string;
  ClientName?: string;
  Detail?: string;
  Debit?: string;
  Credit?: string;
  Balance?: string;
  Module?: string;
  TraceID?: string;
  RefID?: string;
  UpdatedBy?: string;
}

export interface SrdvBalanceLogResponse {
  Error?: SrdvError;
  Result?: SrdvBalanceLogEntry[];
}
