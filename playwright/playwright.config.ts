import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// The URL can be overridden from the environment (Jenkins) without touching code
const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

// Repo folders, resolved from this file so the config works from any cwd
const BACKEND_DIR = path.resolve(__dirname, "..", "backend");
const FRONTEND_DIR = path.resolve(__dirname, "..", "frontend");

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",

  // Maximum time for a whole test, and for each expect() assertion
  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // list: console output | html: detailed report for people (traces, videos)
  // junit: XML that Jenkins reads to show pass/fail counts and trends
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["junit", { outputFile: "reports/junit.xml" }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // Playwright starts both servers before the tests and stops them afterwards.
  // The API suite goes through the Vite proxy (/api -> :3000), so both are needed.
  // Servers that are already running are reused (also in Jenkins, same as the
  // Cypress pipeline, which expects the app up on this PC). Only if nothing is
  // listening does Playwright start them, which needs backend/.env to exist.
  webServer: [
    {
      name: "backend",
      command: "npm start",
      cwd: BACKEND_DIR,
      url: "http://localhost:3000/health",
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      name: "frontend",
      command: "npm run dev",
      cwd: FRONTEND_DIR,
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],

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
