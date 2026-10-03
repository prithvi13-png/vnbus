import type { BookingHistoryResponse, BookingRecord } from "@vnbus/types";

import type { JwtPrincipal } from "../../../shared/security/interfaces/jwt-principal.interface";

export interface BookingHistoryModulePort {
  getHistory(principal: JwtPrincipal): Promise<BookingHistoryResponse>;
  listUpcoming(principal: JwtPrincipal): Promise<BookingRecord[]>;
  listPast(principal: JwtPrincipal): Promise<BookingRecord[]>;
  listCancelled(principal: JwtPrincipal): Promise<BookingRecord[]>;
}
