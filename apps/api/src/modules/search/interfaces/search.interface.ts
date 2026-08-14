import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { BusSearchResponse } from "@vnbus/types";

import type { SearchTripsDto } from "../dto/search-trips.dto";

export interface SearchModulePort {
  getSummary(): ModuleSummary;
  search(dto: SearchTripsDto): Promise<BusSearchResponse>;
}
