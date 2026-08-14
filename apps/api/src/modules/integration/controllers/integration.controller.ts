import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  IntegrationDashboardResponse,
  SupplierHealth,
  SupplierIntegrationConfig,
  SupplierRequestLogRecord,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { parseSupplierCode, UpdateSupplierIntegrationDto } from "../dto/integration-management.dto";
import { IntegrationConfigurationService } from "../services/integration-configuration.service";
import { SupplierManagerService } from "../services/supplier-manager.service";
import { SupplierRequestLogService } from "../services/supplier-request-log.service";

@ApiTags("Integrations")
@ApiBearerAuth()
@Controller("integrations")
export class IntegrationController {
  constructor(
    private readonly manager: SupplierManagerService,
    private readonly configuration: IntegrationConfigurationService,
    private readonly logs: SupplierRequestLogService,
  ) {}

  @Public()
  @Get("health")
  @ApiOkResponse({ description: "Integration framework readiness without exposing secrets." })
  getHealth(): Pick<IntegrationDashboardResponse, "supplierMode" | "security"> {
    const dashboard = this.manager.getDashboard();

    return {
      supplierMode: dashboard.supplierMode,
      security: dashboard.security,
    };
  }

  @Roles("ADMIN")
  @Get("dashboard")
  getDashboard(): IntegrationDashboardResponse {
    return this.manager.getDashboard();
  }

  @Roles("ADMIN")
  @Get("suppliers")
  listSuppliers(): SupplierIntegrationConfig[] {
    return this.manager.listSuppliers();
  }

  @Roles("ADMIN")
  @Patch("suppliers/:code")
  updateSupplier(
    @Param("code") code: string,
    @Body() dto: UpdateSupplierIntegrationDto,
  ): SupplierIntegrationConfig | null {
    const supplierCode = parseSupplierCode(code);

    if (dto.enabled === true) {
      this.manager.enableSupplier(supplierCode);
    }
    if (dto.enabled === false) {
      this.manager.disableSupplier(supplierCode);
    }
    if (dto.priority !== undefined) {
      this.manager.updatePriority(supplierCode, dto.priority);
    }

    return this.manager.listSuppliers().find((supplier) => supplier.code === supplierCode) ?? null;
  }

  @Roles("ADMIN")
  @Get("supplier-priority")
  getSupplierPriority(): Array<Pick<SupplierIntegrationConfig, "code" | "name" | "priority">> {
    return this.manager
      .listSuppliers()
      .map(({ code, name, priority }) => ({ code, name, priority }));
  }

  @Roles("ADMIN")
  @Post("suppliers/:code/test-connection")
  testConnection(@Param("code") code: string): Promise<SupplierHealth> {
    return this.manager.testConnection(parseSupplierCode(code));
  }

  @Roles("ADMIN")
  @Get("logs")
  listLogs(): SupplierRequestLogRecord[] {
    return this.logs.list();
  }

  @Roles("ADMIN")
  @Get("configuration")
  getConfiguration(): {
    paymentProviders: ReturnType<IntegrationConfigurationService["getPaymentProviderConfigs"]>;
    supplierMode: "mock" | "production";
    suppliers: SupplierIntegrationConfig[];
  } {
    return {
      supplierMode: this.configuration.getSupplierMode(),
      suppliers: this.manager.listSuppliers(),
      paymentProviders: this.configuration.getPaymentProviderConfigs(),
    };
  }
}
