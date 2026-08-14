import type { Request } from "express";

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export function getRequestContext(request: Request): RequestContext {
  const context: RequestContext = {};

  if (request.ip) {
    context.ipAddress = request.ip;
  }

  const userAgent = request.get("user-agent");
  if (userAgent) {
    context.userAgent = userAgent;
  }

  const requestId = request.get("x-request-id");
  if (requestId) {
    context.requestId = requestId;
  }

  return context;
}
