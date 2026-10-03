import { Injectable } from "@nestjs/common";
import { normalizeCity } from "@vnbus/shared";
import type {
  BusSearchRequest,
  BusSearchResponse,
  CitySuggestion,
  RecordRecentSearchRequest,
  SearchInsightsResponse,
  SearchSuggestionRecord,
  TripSearchResponse,
} from "@vnbus/types";

import { SearchSummaryDto } from "../dto/search-summary.dto";
import { SearchTripsDto } from "../dto/search-trips.dto";
import type { SearchModulePort } from "../interfaces/search.interface";
import { SupplierManagerService } from "../../integration/services/supplier-manager.service";
import { SearchRepository } from "../repositories/search.repository";
import { SearchModuleValidator } from "../validators/search.validator";
import { CityDirectoryService } from "./city-directory.service";

@Injectable()
export class SearchService implements SearchModulePort {
  constructor(
    private readonly repository: SearchRepository,
    private readonly validator: SearchModuleValidator,
    private readonly supplierManager: SupplierManagerService,
    private readonly cities: CityDirectoryService,
  ) {}

  getSummary(): SearchSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new SearchSummaryDto(summary);
  }

  suggestCities(query: string, limit?: number): CitySuggestion[] {
    return this.cities.suggest(query, limit);
  }

  async search(dto: SearchTripsDto): Promise<BusSearchResponse> {
    this.validator.ensureSearchRequest(dto);
    const request: BusSearchRequest = {
      sourceCity: normalizeCity(dto.sourceCity),
      destinationCity: normalizeCity(dto.destinationCity),
      journeyDate: dto.journeyDate,
      page: dto.page ?? 1,
      pageSize: dto.pageSize ?? 12,
      passengerCount: dto.passengerCount ?? 1,
    };

    copyDefinedSearchOption(request, "minPrice", dto.minPrice);
    copyDefinedSearchOption(request, "maxPrice", dto.maxPrice);
    copyDefinedSearchOption(request, "departureWindows", dto.departureWindows);
    copyDefinedSearchOption(request, "arrivalWindows", dto.arrivalWindows);
    copyDefinedSearchOption(request, "busTypes", dto.busTypes);
    copyDefinedSearchOption(request, "operators", dto.operators);
    copyDefinedSearchOption(request, "amenities", dto.amenities);
    copyDefinedSearchOption(request, "ac", dto.ac);
    copyDefinedSearchOption(request, "nonAc", dto.nonAc);
    copyDefinedSearchOption(request, "sleeper", dto.sleeper);
    copyDefinedSearchOption(request, "seater", dto.seater);
    copyDefinedSearchOption(request, "minAvailableSeats", dto.minAvailableSeats);
    copyDefinedSearchOption(request, "minRating", dto.minRating);
    copyDefinedSearchOption(request, "liveTracking", dto.liveTracking);
    copyDefinedSearchOption(request, "sortBy", dto.sortBy);

    const supplierResponse = await this.supplierManager.searchTrips(request);
    const response = this.repository.searchTrips(supplierResponse.trips, request);
    const notice = supplierResponse.trips.length ? null : describeFailure(supplierResponse.errors);

    return notice ? { ...response, notice } : response;
  }

  getSuggestions(query?: string): SearchSuggestionRecord[] {
    return this.repository.getSuggestions(query);
  }

  getInsights(): SearchInsightsResponse {
    return this.repository.getInsights();
  }

  recordRecentSearch(input: RecordRecentSearchRequest): SearchInsightsResponse {
    return this.repository.recordRecentSearch(input);
  }
}

/**
 * A traveller-facing reason for an empty search. A city the supplier does not
 * serve is worth saying so; anything else is an outage on our side, and the
 * supplier's own wording stays in the logs.
 */
function describeFailure(errors: TripSearchResponse["errors"]): string | null {
  const unknownCity = errors.find((error) => error.message.startsWith("No SRDV city code"));

  if (unknownCity) {
    const city = /"([^"]+)"/u.exec(unknownCity.message)?.[1];

    return city
      ? `We don't have buses from or to ${city} yet. Pick a city from the suggestions.`
      : "We don't have buses on that route yet.";
  }

  return errors.length ? "Bus search is not available right now. Please try again shortly." : null;
}

function copyDefinedSearchOption<TKey extends keyof BusSearchRequest>(
  request: BusSearchRequest,
  key: TKey,
  value: BusSearchRequest[TKey] | undefined,
): void {
  if (value !== undefined) {
    (request as unknown as Record<string, unknown>)[key] = value;
  }
}
