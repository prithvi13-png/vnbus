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
  ErrorCode: number;
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
