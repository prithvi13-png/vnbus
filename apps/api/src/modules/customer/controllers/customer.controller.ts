import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  AgentCustomerDetailsResponse,
  AgentCustomerListResponse,
  AgentCustomerRecord,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { requirePrincipal } from "../../../shared/security/require-user";
import {
  AgentCustomerListQueryDto,
  CreateAgentCustomerDto,
  UpdateAgentCustomerDto,
} from "../dto/agent-customer.dto";
import { CustomerSummaryDto } from "../dto/customer-summary.dto";
import { CustomerService } from "../services/customer.service";

@ApiTags("Customer")
@ApiBearerAuth()
@Controller()
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Public()
  @Get("customer/health")
  getHealth(): CustomerSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("customer/capabilities")
  getCapabilities(): CustomerSummaryDto {
    return this.service.getSummary();
  }

  // A travel agent's own customer book. Names, phones and emails, so agents
  // only, and each agent sees only the customers they added.
  @Roles("TRAVEL_AGENT")
  @Get("agent/customers")
  @ApiOkResponse({ description: "Agent-managed customer list with search and pagination" })
  listAgentCustomers(
    @Query() query: AgentCustomerListQueryDto,
    @Req() request: AuthenticatedRequest,
  ): AgentCustomerListResponse {
    return this.service.listCustomers(requirePrincipal(request), query);
  }

  @Roles("TRAVEL_AGENT")
  @Get("agent/customers/:id")
  @ApiOkResponse({ description: "Agent-managed customer profile with booking history" })
  getAgentCustomer(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<AgentCustomerDetailsResponse> {
    return this.service.getCustomerDetails(requirePrincipal(request), id);
  }

  @Roles("TRAVEL_AGENT")
  @Post("agent/customers")
  @ApiOkResponse({ description: "Create agent-managed customer" })
  createAgentCustomer(
    @Body() dto: CreateAgentCustomerDto,
    @Req() request: AuthenticatedRequest,
  ): AgentCustomerRecord {
    return this.service.createCustomer(requirePrincipal(request), dto);
  }

  @Roles("TRAVEL_AGENT")
  @Patch("agent/customers/:id")
  @ApiOkResponse({ description: "Update agent-managed customer" })
  updateAgentCustomer(
    @Param("id") id: string,
    @Body() dto: UpdateAgentCustomerDto,
    @Req() request: AuthenticatedRequest,
  ): AgentCustomerRecord {
    return this.service.updateCustomer(requirePrincipal(request), id, dto);
  }

  @Roles("TRAVEL_AGENT")
  @Delete("agent/customers/:id")
  @ApiOkResponse({ description: "Delete agent-managed customer" })
  deleteAgentCustomer(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ): { customerId: string; deleted: boolean } {
    return this.service.deleteCustomer(requirePrincipal(request), id);
  }
}
