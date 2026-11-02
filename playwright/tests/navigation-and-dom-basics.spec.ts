// ============================================================
// FEATURE: Navigation and DOM Basics
// Test cases: TC-001 to TC-030
// Cypress equivalent: cypress/e2e/navigation-and-dom-basics.cy.js
//
// Main equivalences with Cypress:
//   cy.visit()            -> page.goto()  (through page objects)
//   cy.get(sel).should()  -> await expect(locator).toXxx()   (web-first, auto-retrying)
//   cy.title()            -> expect(page).toHaveTitle()
//   cy.url()              -> expect(page).toHaveURL() / page.url()
//   cy.document()/window  -> page.evaluate()
//   cy.go / cy.reload     -> page.goBack() / goForward() / reload()
//   cy.log()              -> test.step()
//   before/after          -> test.beforeAll / test.afterAll
//   beforeEach/afterEach  -> test.beforeEach / test.afterEach
//   it.only               -> test.only
//
// Page objects: HomePage, NavbarPage, LoginPage, StandingsPage
// Assertions stay in the tests.
// ============================================================
import { test, expect } from "./support/fixtures";

test.describe("Navigation and DOM Basics", () => {
  // ------------------------------------------------------------
  // HOOKS
  // beforeAll  -> ONCE before all tests in the describe (per worker)
  // afterAll   -> ONCE after all tests in the describe (per worker)
  // beforeEach -> before EACH test
  // afterEach  -> after EACH test
  // ------------------------------------------------------------
  test.beforeAll(() => {
    console.log("Starting suite: Navigation and DOM Basics");
  });

  test.afterAll(() => {
    console.log("Suite finished: Navigation and DOM Basics");
  });

  test.beforeEach(async ({ homePage }) => {
    await homePage.visit();
  });

  // ------------------------------------------------------------
  // Page navigation
  // ------------------------------------------------------------
  test.describe("Page navigation", () => {
    test("TC-001-Verify the home page loads at the root URL", async ({ page }) => {
      expect(new URL(page.url()).pathname).toBe("/");
    });

    test("TC-002-Verify the fixtures page loads at /fixtures", async ({ page }) => {
      await page.goto("/fixtures");
      await expect(page).toHaveURL(/\/fixtures/);
    });

    test("TC-003-Verify the standings page loads at /standings", async ({
      page,
      standingsPage,
    }) => {
      await standingsPage.visit();
      await expect(page).toHaveURL(/\/standings/);
    });

    test("TC-004-Verify the players page loads at /players", async ({ page }) => {
      await page.goto("/players");
      await expect(page).toHaveURL(/\/players/);
    });

    test("TC-005-Verify the login page loads at /login", async ({ page, loginPage }) => {
      await loginPage.visit();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  // ------------------------------------------------------------
  // Page titles
  // Requires the app to set a dynamic <title> per route
  // ------------------------------------------------------------
  test.describe("Page titles", () => {
    test('TC-006-Verify the home page title contains "FutbolStats"', async ({ page }) => {
      await expect(page).toHaveTitle(/FutbolStats/);
    });

    test('TC-007-Verify the fixtures page title contains "Partidos"', async ({ page }) => {
      await page.goto("/fixtures");
      await expect(page).toHaveTitle(/Partidos/);
    });

    test('TC-008-Verify the standings page title contains "Tabla"', async ({
      page,
      standingsPage,
    }) => {
      await standingsPage.visit();
      await expect(page).toHaveTitle(/Tabla/);
    });

    test('TC-009-Verify the players page title contains "Jugadores"', async ({ page }) => {
      await page.goto("/players");
      await expect(page).toHaveTitle(/Jugadores/);
    });

    test('TC-010-Verify the login page title contains "Login"', async ({
      page,
      loginPage,
    }) => {
      await loginPage.visit();
      await expect(page).toHaveTitle(/Login/);
    });
  });

  // ------------------------------------------------------------
  // Named steps in the report (equivalent to cy.log)
  // ------------------------------------------------------------
  test.describe("Logging steps", () => {
    test("TC-011-Verify the navbar and main content are present while logging each step", async ({
      navbar,
      homePage,
    }) => {
      await test.step("Verifying the home page loads correctly", async () => {
        await expect(navbar.nav).toBeVisible();
      });
      await test.step("Main content present", async () => {
        await expect(homePage.main).toBeAttached();
      });
    });
  });

  // ------------------------------------------------------------
  // Selectors: tag, class, id, attribute, data-testid, text
  // ------------------------------------------------------------
  test.describe("Selectors", () => {
    test("TC-012-Verify the navbar can be selected by tag", async ({ navbar }) => {
      await expect(navbar.nav).toBeAttached();
    });

    test("TC-013-Verify the navbar links can be selected by CSS path", async ({ navbar }) => {
      await expect(navbar.links.first()).toBeAttached();
      expect(await navbar.links.count()).toBeGreaterThan(0);
    });

    test("TC-014-Verify a link can be selected by its href attribute", async ({ navbar }) => {
      await expect(navbar.link("/fixtures")).toBeAttached();
    });

    test("TC-015-Verify the login email and password inputs can be selected by type attribute", async ({
      loginPage,
    }) => {
      await loginPage.visit();
      await expect(loginPage.inputEmail).toBeAttached();
      await expect(loginPage.inputPassword).toBeAttached();
    });

    test("TC-016-Verify the navbar texts are visible using a text lookup", async ({ page }) => {
      // .first(): getByText is strict; cy.contains() returned the first match
      await expect(page.getByText("Partidos").first()).toBeVisible();
      await expect(page.getByText("Tabla").first()).toBeVisible();
      await expect(page.getByText("Jugadores").first()).toBeVisible();
    });

    test("TC-017-Verify the app title text exists", async ({ page }) => {
      await expect(page.getByText("FUTBOL").first()).toBeAttached();
    });

    test("TC-018-Verify the navbar can be selected by data-testid", async ({ navbar }) => {
      await expect(navbar.contenedor).toBeAttached();
    });
  });

  // ------------------------------------------------------------
  // Document and charset
  // ------------------------------------------------------------
  test.describe("Document", () => {
    test("TC-019-Verify the document exists and is accessible", async ({ page }) => {
      const exists = await page.evaluate(() => !!document);
      expect(exists).toBe(true);
    });

    test("TC-020-Verify the document charset is UTF-8", async ({ page }) => {
      expect(await page.evaluate(() => document.characterSet)).toBe("UTF-8");
    });

    test("TC-021-Verify the document content type is text/html", async ({ page }) => {
      expect(await page.evaluate(() => document.contentType)).toBe("text/html");
    });
  });

  // ------------------------------------------------------------
  // Current URL and window
  // ------------------------------------------------------------
  test.describe("Current URL and window", () => {
    test("TC-022-Verify the home URL has no additional path", async ({ page }) => {
      expect(new URL(page.url()).pathname).toBe("/");
    });

    test("TC-023-Verify the URL changes after navigating to /fixtures", async ({ page }) => {
      await page.goto("/fixtures");
      await expect(page).toHaveURL(/\/fixtures/);
    });

    test("TC-024-Verify the window object exists", async ({ page }) => {
      expect(await page.evaluate(() => typeof window)).toBe("object");
    });

    test("TC-025-Verify window.location.pathname matches the current route", async ({
      page,
    }) => {
      expect(await page.evaluate(() => window.location.pathname)).toBe("/");
    });

    test("TC-026-Verify window.document exists", async ({ page }) => {
      expect(await page.evaluate(() => !!window.document)).toBe(true);
    });
  });

  // ------------------------------------------------------------
  // Browser history: goBack / goForward / reload
  // ------------------------------------------------------------
  test.describe("Browser history", () => {
    test("TC-027-Verify going back returns to the previous page", async ({
      page,
      standingsPage,
    }) => {
      await page.goto("/fixtures");
      await standingsPage.visit();
      await page.goBack();
      await expect(page).toHaveURL(/\/fixtures/);
    });

    test("TC-028-Verify going forward moves to the next page", async ({
      page,
      standingsPage,
    }) => {
      await page.goto("/fixtures");
      await standingsPage.visit();
      await page.goBack();
      await page.goForward();
      await expect(page).toHaveURL(/\/standings/);
    });

    test("TC-029-Verify reloading keeps the current route", async ({ page }) => {
      await page.goto("/fixtures");
      await page.reload();
      await expect(page).toHaveURL(/\/fixtures/);
    });

    test("TC-030-Verify reloading keeps the page content", async ({
      page,
      standingsPage,
    }) => {
      await standingsPage.visit();
      await page.reload();
      await expect(standingsPage.tabla).toBeAttached();
    });
  });
});
