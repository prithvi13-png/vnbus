import { expect, test, type Page } from "@playwright/test";

import { testBooking, useFakeApi } from "./fixtures/fake-api";

test.setTimeout(180_000);

const customer = {
  id: "test-customer",
  firstName: "Customer",
  lastName: "User",
  email: "user@test.invalid",
  phone: "+919999999999",
  avatar: null,
  role: "CUSTOMER",
  roles: ["CUSTOMER"],
  permissions: ["profile.view", "profile.update", "bookings.view"],
  status: "ACTIVE",
  emailVerified: true,
  forcePasswordChange: false,
};

test("an expired access token is renewed once and the requests replayed", async ({ page }) => {
  const api = await useFakeApi(page);
  api.bookings.push(testBooking("VNB-RENEWED1"));
  api.expiredTokens.add("expired-token");
  api.refresh = {
    outcome: "renew",
    session: { user: customer, accessToken: "renewed-token", refreshToken: "rotated" },
  };
  await withRefreshCookie(page);
  await signInOnce(page, "expired-token");

  // Booking history and the notifications bell both load at once, so two
  // requests expire together.
  await page.goto("/booking-history");

  await expect(page.getByText("VNB-RENEWED1").first()).toBeVisible();
  await expect(page).toHaveURL(/\/booking-history$/u);
  // One renewal for both, sent with the refresh cookie rather than a token.
  expect(api.refreshCookies).toHaveLength(1);
  expect(api.refreshCookies[0]).toContain("vn_refresh_token=refresh-cookie");
  for (const path of ["/bookings/history", "/notifications"]) {
    expect(
      api.protectedCalls.filter((call) => call.path === path).map((call) => call.token),
    ).toEqual(["expired-token", "renewed-token"]);
  }
  expect(await storedSession(page)).toEqual(
    expect.objectContaining({ accessToken: "renewed-token" }),
  );
});

test("a refused renewal clears the session and sends the user to login", async ({ page }) => {
  const api = await useFakeApi(page);
  api.expiredTokens.add("expired-token");
  api.refresh = { outcome: "refuse" };
  await signInOnce(page, "expired-token");

  await page.goto("/booking-history");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fbooking-history$/u);
  await expect(page.getByRole("button", { name: /sign in|log in/i }).first()).toBeVisible();
  expect(api.refreshCookies).toHaveLength(1);
  expect(await storedSession(page)).toEqual(
    expect.objectContaining({ accessToken: null, user: null }),
  );
});

test("a request refused again after renewal is not retried a second time", async ({ page }) => {
  const api = await useFakeApi(page);
  // The renewed token is refused too, as if the API rejected it outright.
  api.expiredTokens.add("expired-token");
  api.expiredTokens.add("renewed-token");
  api.refresh = {
    outcome: "renew",
    session: { user: customer, accessToken: "renewed-token", refreshToken: "rotated" },
  };
  await signInOnce(page, "expired-token");
  await page.goto("/profile");

  await page.getByRole("button", { name: "Save profile" }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "Access token is invalid or expired" }),
  ).toBeVisible();
  // The original attempt and exactly one replay; no further renew-and-retry.
  expect(api.protectedCalls.filter((call) => call.path === "/users/profile")).toHaveLength(2);
});

/** Signs in for the first page load only, so a later redirect sees the real state. */
async function signInOnce(page: Page, accessToken: string): Promise<void> {
  await page.addInitScript(
    ({ token, user }) => {
      if (window.sessionStorage.getItem("test-signed-in")) {
        return;
      }
      window.sessionStorage.setItem("test-signed-in", "1");
      window.localStorage.setItem(
        "vnbus-auth",
        JSON.stringify({ state: { accessToken: token, user }, version: 0 }),
      );
    },
    { token: accessToken, user: customer },
  );
}

/** The httpOnly refresh cookie the API sets at login, scoped as the API scopes it. */
async function withRefreshCookie(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: "vn_refresh_token",
      value: "refresh-cookie",
      domain: "127.0.0.1",
      path: "/api/v1/auth",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

async function storedSession(page: Page): Promise<unknown> {
  return page.evaluate(
    () => JSON.parse(window.localStorage.getItem("vnbus-auth") ?? "{}").state as unknown,
  );
}
