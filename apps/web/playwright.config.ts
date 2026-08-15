import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2,
  expect: {
    timeout: 30_000,
  },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "pnpm dev:test",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
