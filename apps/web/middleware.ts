import { NextResponse, type NextRequest } from "next/server";

const maintenanceAllowedPrefixes = ["/maintenance", "/admin", "/login", "/_next", "/favicon.ico"];

export function middleware(request: NextRequest): NextResponse {
  const maintenanceEnabled = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const { pathname } = request.nextUrl;

  if (
    maintenanceEnabled &&
    !maintenanceAllowedPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|.*\\..*).*)"],
};
