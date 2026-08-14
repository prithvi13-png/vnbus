import { Module } from "@nestjs/common";

import { IntegrationModule } from "../integration/integration.module";
import { SearchController } from "./controllers/search.controller";
import { SearchRepository } from "./repositories/search.repository";
import { SearchService } from "./services/search.service";
import { SearchModuleValidator } from "./validators/search.validator";

@Module({
  imports: [IntegrationModule],
  controllers: [SearchController],
  providers: [SearchService, SearchRepository, SearchModuleValidator],
  exports: [SearchService],
})
export class SearchModule {}
