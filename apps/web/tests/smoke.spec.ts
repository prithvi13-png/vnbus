import { expect, test } from "@playwright/test";

test.setTimeout(60_000);

test("landing page exposes the bus search experience", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Vriddhi Nexus Pvt Ltd" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Search", exact: true })).toBeVisible();
});

test("search route renders mock bus results from query params", async ({ page }) => {
  const journeyDate = futureIsoDate();

  await page.goto(`/search?from=Bangalore&to=Hyderabad&date=${journeyDate}`);

  await expect(page.getByRole("heading", { name: "Bangalore to Hyderabad" })).toBeVisible();
  await expect(page.getByText(/buses found/i).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Filters" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("link", { name: /View Seats/i }).first()).toBeVisible({
    timeout: 20_000,
  });
});

test("mock booking flow reaches ticket view", async ({ page }) => {
  const journeyDate = futureIsoDate();

  await page.goto(`/seat-layout?tripId=mock-route-001-1&date=${journeyDate}`);

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

test("admin dashboard route renders", async ({ page }) => {
  await page.goto("/admin/dashboard");

  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
});

test("admin integration configuration renders milestone ten controls", async ({ page }) => {
  await page.goto("/admin/supplier-configuration");

  await expect(page.getByRole("heading", { name: "Integration Configuration" })).toBeVisible();
  await expect(page.getByText("Supplier Mode")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Payments" })).toBeVisible();
  await page.getByRole("tab", { name: "Payments" }).click();
  await expect(page.getByText("Razorpay")).toBeVisible();
});

test("agent portal routes render milestone seven workspaces", async ({ page }) => {
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
