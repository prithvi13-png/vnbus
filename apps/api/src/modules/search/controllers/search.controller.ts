import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  BusSearchResponse,
  SearchInsightsResponse,
  SearchSuggestionRecord,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { SearchSummaryDto } from "../dto/search-summary.dto";
import { RecordRecentSearchDto } from "../dto/search-insights.dto";
import { SearchTripsDto } from "../dto/search-trips.dto";
import { SearchService } from "../services/search.service";

@ApiTags("Search")
@ApiBearerAuth()
@Controller("search")
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Public()
  @Get("health")
  getHealth(): SearchSummaryDto {
    return this.service.getSummary();
  }

  @Public()
  @ApiOkResponse({
    description: "Production-shaped mock bus search response.",
    schema: {
      example: {
        success: true,
        totalResults: 32,
        buses: [],
        filters: {},
        pagination: {
          page: 1,
          pageSize: 12,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  @Post()
  search(@Body() dto: SearchTripsDto): Promise<BusSearchResponse> {
    return this.service.search(dto);
  }

  @Public()
  @Get("mock-dataset")
  getMockDataset(): ReturnType<SearchService["getDatasetSummary"]> {
    return this.service.getDatasetSummary();
  }

  @Public()
  @Get("suggestions")
  @ApiOkResponse({ description: "Autocomplete, popular, and cached route suggestions" })
  getSuggestions(@Query("q") query?: string): SearchSuggestionRecord[] {
    return this.service.getSuggestions(query);
  }

  @Public()
  @Post("recent")
  @ApiOkResponse({ description: "Persist a recent search into the recent search cache" })
  recordRecentSearch(@Body() dto: RecordRecentSearchDto): SearchInsightsResponse {
    return this.service.recordRecentSearch(dto);
  }

  @Roles("ADMIN")
  @Get("insights")
  @ApiOkResponse({ description: "Search analytics insights and cache-backed search metrics" })
  getInsights(): SearchInsightsResponse {
    return this.service.getInsights();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): SearchSummaryDto {
    return this.service.getSummary();
  }
}
