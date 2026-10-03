import { Module } from "@nestjs/common";

import { IntegrationModule } from "../integration/integration.module";
import { SearchController } from "./controllers/search.controller";
import { SearchRepository } from "./repositories/search.repository";
import { CityDirectoryService } from "./services/city-directory.service";
import { SearchService } from "./services/search.service";
import { SearchModuleValidator } from "./validators/search.validator";

@Module({
  imports: [IntegrationModule],
  controllers: [SearchController],
  providers: [SearchService, SearchRepository, SearchModuleValidator, CityDirectoryService],
  exports: [SearchService],
})
export class SearchModule {}
