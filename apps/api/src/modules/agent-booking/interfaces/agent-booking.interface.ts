import type {
  AgentBookingListQuery,
  AgentBookingListResponse,
  AgentEmailTicketRequest,
  CreateAgentBookingRequest,
  CreateAgentBookingResponse,
  TicketEmailResponse,
} from "@vnbus/types";

export interface AgentBookingModulePort {
  listBookings(query?: AgentBookingListQuery): AgentBookingListResponse;
  createBooking(request: CreateAgentBookingRequest): Promise<CreateAgentBookingResponse>;
  emailTicket(request: AgentEmailTicketRequest): Promise<TicketEmailResponse>;
}
