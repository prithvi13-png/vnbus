import type { BookingHistoryResponse, BookingRecord } from "@vnbus/types";

export interface BookingHistoryModulePort {
  getHistory(): BookingHistoryResponse;
  listUpcoming(): BookingRecord[];
  listPast(): BookingRecord[];
  listCancelled(): BookingRecord[];
}
