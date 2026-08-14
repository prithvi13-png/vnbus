import { Injectable } from "@nestjs/common";
import { MockSupplierAdapter } from "@vnbus/supplier-sdk";
import type { BusSearchResult, TripSearchQuery } from "@vnbus/types";

@Injectable()
export class MockSearchProvider {
  private readonly adapter = new MockSupplierAdapter();

  searchTrips(query: TripSearchQuery): Promise<BusSearchResult[]> {
    return this.adapter.searchTrips(query).then((response) => response.trips);
  }
}
