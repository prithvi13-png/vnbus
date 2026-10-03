import { expect, test, type Page } from "@playwright/test";

import { TEST_API_ORIGIN, testBooking, useFakeApi } from "./fixtures/fake-api";

test.setTimeout(180_000);

test("landing page exposes the bus search experience", async ({ page }) => {
  await useFakeApi(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Vriddhi Nexus Pvt Ltd" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Search", exact: true })).toBeVisible();
});

test("search route renders supplier bus results from query params", async ({ page }) => {
  await useFakeApi(page);
  const journeyDate = futureIsoDate();

  await page.goto(`/search?from=Bangalore&to=Hyderabad&date=${journeyDate}`);

  await expect(page.getByRole("heading", { name: "Bangalore to Hyderabad" })).toBeVisible();
  await expect(page.getByText(/buses found/i).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Filters" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Test Travels 1")).toBeVisible();
  await expect(page.getByRole("link", { name: /View Seats/i }).first()).toBeVisible({
    timeout: 20_000,
  });
});

test("booking flow reaches ticket view", async ({ page }) => {
  await useFakeApi(page);
  const journeyDate = futureIsoDate();
  const tripId = encodeURIComponent("trace-1~1~result-1~6");

  // Booking requires an account: Continue sends guests to login.
  await signInAs(page, "CUSTOMER");
  await page.goto(`/seat-layout?tripId=${tripId}&date=${journeyDate}`);

  await expect(page.getByRole("heading", { name: "Choose seats and points" })).toBeVisible();
  const firstAvailableSeat = page.locator('button[aria-pressed="false"]:not([disabled])').first();
  await expect(firstAvailableSeat).toBeVisible({ timeout: 20_000 });
  await firstAvailableSeat.click();
  await Promise.all([
    page.waitForURL("**/passenger-details", { timeout: 15_000 }),
    page.getByRole("button", { name: "Continue" }).click(),
  ]);

  await expect(page.getByRole("heading", { name: "Passenger Details" })).toBeVisible({
    timeout: 15_000,
  });
  await page.getByLabel("First Name").fill("Aarav");
  await page.getByLabel("Last Name").fill("Sharma");
  await page.getByLabel("Age").fill("29");
  await page.getByLabel("Phone").fill("+919876543210");
  await page.getByLabel("Email", { exact: true }).fill("aarav.sharma@test.invalid");
  await Promise.all([
    page.waitForURL("**/booking-review", { timeout: 15_000 }),
    page.getByRole("button", { name: /Review booking/i }).click(),
  ]);

  await expect(page.getByRole("heading", { name: "Booking Review" })).toBeVisible();
  await Promise.all([
    page.waitForURL(/booking-confirmation/, { timeout: 15_000 }),
    page.getByRole("button", { name: /Confirm Booking/i }).click(),
  ]);

  await expect(page.getByText("Booking Confirmed")).toBeVisible();
  await expect(page.getByText("PNR-TEST-1")).toBeVisible();
  await expect(page.getByRole("button", { name: /Download Invoice/i })).toBeVisible();
  await Promise.all([
    page.waitForURL(/ticket/, { timeout: 15_000 }),
    page.getByRole("link", { name: /View ticket/i }).click(),
  ]);
  await expect(page.getByText("Live Tracking Coming Soon")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: /Download Ticket/i })).toBeVisible();

  await page.goto("/booking-history");
  await expect(page.getByRole("heading", { name: "Booking History" })).toBeVisible();
  await expect(page.getByText(/TICKET GENERATED/i).first()).toBeVisible();

  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: "Notification Center" })).toBeVisible();
  await expect(page.getByText("Ticket generated").first()).toBeVisible();
});

test("an expired search asks the traveller to search again", async ({ page }) => {
  const api = await useFakeApi(page);
  await page.route(`${TEST_API_ORIGIN}/api/v1/seats/**`, (route) =>
    route.request().method() === "GET"
      ? route.fulfill({
          status: 410,
          headers: {
            "Access-Control-Allow-Origin": "http://127.0.0.1:3100",
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            statusCode: 410,
            message: "This bus is no longer available to book from that search.",
          }),
        })
      : api.handle(route),
  );

  await page.goto(`/seat-layout?tripId=stale&date=${futureIsoDate()}`);

  await expect(page.getByText("Seats are not available")).toBeVisible();
  await expect(page.getByText(/no longer available to book/)).toBeVisible();
});

test("admin dashboard route renders", async ({ page }) => {
  await useFakeApi(page);
  await signInAs(page, "ADMIN");
  await page.goto("/admin/dashboard");

  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  await expect(page.getByText("Today's Bookings")).toBeVisible();
});

test("admin integration configuration shows suppliers and payment gateways", async ({ page }) => {
  await useFakeApi(page);
  await signInAs(page, "ADMIN");
  await page.goto("/admin/supplier-configuration");

  await expect(page.getByRole("heading", { name: "Integration Configuration" })).toBeVisible();
  await expect(page.getByText("SRDV Technologies")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Payments" })).toBeVisible();
  await page.getByRole("tab", { name: "Payments" }).click();
  await expect(page.getByText("Razorpay")).toBeVisible();
});

test("admin bookings generate invoices and upload bulk booking sheet", async ({ page }) => {
  const api = await useFakeApi(page);
  api.adminBookings = [testBooking("VNB-ADM001")];
  await signInAs(page, "ADMIN");
  await page.goto("/admin/bookings");

  await page.getByRole("button", { name: "Generate Invoice" }).first().click();
  await expect(page.getByText(/VNI-ADM001 generated and uploaded/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Invoice Repository" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "VNI-ADM001" })).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: "bulk-bookings.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      [
        "bookingReference,customerName,customerEmail,customerPhone,route,operatorName,journeyDate,seats,baseFare,taxes,discount,convenienceFee,total",
        "VNB-BULK-101,Kavya Nair,kavya@test.invalid,+919876543219,Bangalore to Hyderabad,Test Travels,2026-08-28,A1 A2,2000,100,0,50,2150",
      ].join("\n"),
    ),
  });

  await expect(page.getByText(/Uploaded 1 booking and generated 1 invoice/)).toBeVisible();
  await expect(page.getByRole("cell", { name: "VNB-BULK-101" })).toBeVisible();
});

test("customer cannot access the admin dashboard", async ({ page }) => {
  await useFakeApi(page);
  await signInAs(page, "CUSTOMER");
  await page.goto("/admin/dashboard");

  await expect(page).toHaveURL(/\/unauthorized/);
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
});

test("dashboard shortcut sends guests to login", async ({ page }) => {
  await useFakeApi(page);
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
  await expect(page.getByRole("heading", { name: "Sign in" }).first()).toBeVisible();
});

test("dashboard shortcut sends customers to customer dashboard", async ({ page }) => {
  await useFakeApi(page);
  await signInAs(page, "CUSTOMER");
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/customer\/dashboard/);
  await expect(page.getByRole("heading", { name: "Customer Dashboard" })).toBeVisible();
});

test("dashboard shortcut sends admins to admin dashboard", async ({ page }) => {
  await useFakeApi(page);
  await signInAs(page, "ADMIN");
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
});

test("agent portal routes render the agent workspaces", async ({ page }) => {
  await useFakeApi(page);
  await signInAs(page, "TRAVEL_AGENT");
  await page.goto("/agent/dashboard");
  await expect(page.getByRole("heading", { name: "Agent Dashboard" })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText("Today's Bookings")).toBeVisible();

  await page.goto("/agent/quick-booking");
  await expect(page.getByRole("heading", { name: "Quick Booking" })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByRole("button", { name: "Search", exact: true })).toBeVisible();
});

test("auth routes expose milestone two forms", async ({ page }) => {
  await useFakeApi(page);
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  await page.goto("/reset-password?token=abcdefghijklmnopqrstuvwxyz123456");
  await expect(page.getByRole("heading", { name: "Set new password" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Update password" })).toBeVisible();

  await page.goto("/verify-email?token=abcdefghijklmnopqrstuvwxyz123456");
  await expect(page.getByRole("heading", { name: "Verify email" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify email" })).toBeVisible();
});

function futureIsoDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 30);

  return date.toISOString().slice(0, 10);
}

type TestRole = "ADMIN" | "CUSTOMER" | "TRAVEL_AGENT";

async function signInAs(page: Page, role: TestRole): Promise<void> {
  await page.addInitScript((selectedRole) => {
    const user = {
      id:
        selectedRole === "ADMIN"
          ? "test-admin"
          : selectedRole === "TRAVEL_AGENT"
            ? "test-agent"
            : "test-customer",
      firstName:
        selectedRole === "ADMIN" ? "Admin" : selectedRole === "TRAVEL_AGENT" ? "Agent" : "Customer",
      lastName: "User",
      email:
        selectedRole === "ADMIN"
          ? "admin@test.invalid"
          : selectedRole === "TRAVEL_AGENT"
            ? "agent@test.invalid"
            : "user@test.invalid",
      phone: "+919999999999",
      avatar: null,
      role: selectedRole,
      roles: [selectedRole],
      permissions:
        selectedRole === "ADMIN"
          ? ["admin.dashboard", "settings.manage", "users.view"]
          : selectedRole === "TRAVEL_AGENT"
            ? ["agent.dashboard", "bookings.create", "customers.view"]
            : ["profile.view", "profile.update", "bookings.view"],
      status: "ACTIVE",
      emailVerified: true,
      forcePasswordChange: false,
    };

    window.localStorage.setItem(
      "vnbus-auth",
      JSON.stringify({
        state: {
          accessToken: `${selectedRole.toLowerCase()}-test-token`,
          user,
        },
        version: 0,
      }),
    );
  }, role);
}
