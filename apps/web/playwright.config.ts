import { defineConfig, devices } from "@playwright/test";

const chromiumProject = {
  name: "chromium",
  use: { ...devices["Desktop Chrome"] },
};

const mobileProject = {
  name: "mobile",
  use: { ...devices["Pixel 7"] },
};

export default defineConfig({
  testDir: "./tests",
  timeout: 180_000,
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2,
  expect: {
    timeout: 45_000,
  },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: process.env.CI ? [chromiumProject] : [chromiumProject, mobileProject],
  webServer: {
    command: "pnpm dev:test",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
