import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    // UI suites (same as the Cypress UI specs)
    {
      name: "chromium",
      testMatch:
        /(navigation-and-dom-basics|forms-and-user-interactions|dom-traversal-and-tables|session-network-and-test-data)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // REST API suite. Needs no browser.
    {
      name: "api",
      testMatch: /rest-api-endpoints\.spec\.ts/,
    },
    // Database suite.
    // Runs AFTER the API suite: the API creates and deletes fixtures, and the
    // database suite compares counts between queries. To run it on its own:
    //   npx playwright test --project=database --no-deps
    {
      name: "database",
      testMatch: /database-queries-and-integrity\.spec\.ts/,
      dependencies: ["api"],
    },
  ],
});
