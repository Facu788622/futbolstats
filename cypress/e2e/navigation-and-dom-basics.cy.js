// ============================================================
// FEATURE: Navigation and DOM Basics
// Test cases: TC-001 to TC-030
// Playwright equivalent: playwright/tests/navigation-and-dom-basics.spec.ts
//
// Covers:
//   cy.visit(), cy.title(), cy.log(), cy.get(), cy.contains()
//   cy.document(), charset, url
//   Window references
//   Browser history: go back / forward / reload
//   Test structure: describe / it / it.only
//   Hooks: before / beforeEach / after / afterEach
//   CSS selectors: ID, class, attribute, tag
//
// Page objects used: HomePage, NavbarPage, LoginPage, StandingsPage
// (selectors live in cypress/fixtures/selectors.json)
// Assertions stay in the tests. Direct cy.visit("/path") calls are kept
// where the purpose of the test is the navigation itself.
// ============================================================
import homePage from "../support/pages/HomePage";
import navbar from "../support/pages/NavbarPage";
import loginPage from "../support/pages/LoginPage";
import standingsPage from "../support/pages/StandingsPage";

describe("Navigation and DOM Basics", () => {
  // ------------------------------------------------------------
  // HOOKS
  // before     -> runs ONCE before all tests in the describe
  // after      -> runs ONCE after all tests in the describe
  // beforeEach -> runs before EACH test
  // afterEach  -> runs after EACH test
  // ------------------------------------------------------------
  before(() => {
    cy.log("Starting suite: Navigation and DOM Basics");
  });

  after(() => {
    cy.log("Suite finished: Navigation and DOM Basics");
  });

  beforeEach(() => {
    homePage.visit();
  });

  // ------------------------------------------------------------
  // Page navigation
  // ------------------------------------------------------------
  describe("Page navigation", () => {
    it("TC-001-Verify the home page loads at the root URL", () => {
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
    });

    it("TC-002-Verify the fixtures page loads at /fixtures", () => {
      cy.visit("/fixtures");
      cy.url().should("include", "/fixtures");
    });

    it("TC-003-Verify the standings page loads at /standings", () => {
      standingsPage.visit();
      cy.url().should("include", "/standings");
    });

    it("TC-004-Verify the players page loads at /players", () => {
      cy.visit("/players");
      cy.url().should("include", "/players");
    });

    it("TC-005-Verify the login page loads at /login", () => {
      loginPage.visit();
      cy.url().should("include", "/login");
    });
  });

  // ------------------------------------------------------------
  // Page titles
  // Requires the app to set a dynamic <title> per route
  // ------------------------------------------------------------
  describe("Page titles", () => {
    it('TC-006-Verify the home page title contains "FutbolStats"', () => {
      cy.title().should("include", "FutbolStats");
    });

    it('TC-007-Verify the fixtures page title contains "Partidos"', () => {
      cy.visit("/fixtures");
      cy.title().should("include", "Partidos");
    });

    it('TC-008-Verify the standings page title contains "Tabla"', () => {
      standingsPage.visit();
      cy.title().should("include", "Tabla");
    });

    it('TC-009-Verify the players page title contains "Jugadores"', () => {
      cy.visit("/players");
      cy.title().should("include", "Jugadores");
    });

    it('TC-010-Verify the login page title contains "Login"', () => {
      loginPage.visit();
      cy.title().should("include", "Login");
    });
  });

  // ------------------------------------------------------------
  // Logging steps in the Cypress runner
  // ------------------------------------------------------------
  describe("Logging steps", () => {
    it("TC-011-Verify the navbar and main content are present while logging each step", () => {
      cy.log("Verifying the home page loads correctly");
      navbar.nav().should("be.visible");
      cy.log("Navbar visible - OK");
      homePage.main().should("exist");
      cy.log("Main content present - OK");
    });
  });

  // ------------------------------------------------------------
  // Selectors: tag, class, id, attribute, data-testid, text
  // ------------------------------------------------------------
  describe("Selectors", () => {
    it("TC-012-Verify the navbar can be selected by tag", () => {
      navbar.nav().should("exist");
    });

    it("TC-013-Verify the navbar links can be selected by CSS path", () => {
      navbar.links().should("have.length.greaterThan", 0);
    });

    it("TC-014-Verify a link can be selected by its href attribute", () => {
      navbar.link("/fixtures").should("exist");
    });

    it("TC-015-Verify the login email and password inputs can be selected by type attribute", () => {
      loginPage.visit();
      loginPage.inputEmail().should("exist");
      loginPage.inputPassword().should("exist");
    });

    it("TC-016-Verify the navbar texts are visible using a text lookup", () => {
      cy.contains("Partidos").should("be.visible");
      cy.contains("Tabla").should("be.visible");
      cy.contains("Jugadores").should("be.visible");
    });

    it("TC-017-Verify the app title text exists", () => {
      cy.contains("FUTBOL").should("exist");
    });

    it("TC-018-Verify the navbar can be selected by data-testid", () => {
      navbar.contenedor().should("exist");
    });
  });

  // ------------------------------------------------------------
  // Document and charset
  // ------------------------------------------------------------
  describe("Document", () => {
    it("TC-019-Verify the document exists and is accessible", () => {
      cy.document().should("exist");
    });

    it("TC-020-Verify the document charset is UTF-8", () => {
      cy.document().its("characterSet").should("eq", "UTF-8");
    });

    it("TC-021-Verify the document content type is text/html", () => {
      cy.document().its("contentType").should("eq", "text/html");
    });
  });

  // ------------------------------------------------------------
  // Current URL and window
  // ------------------------------------------------------------
  describe("Current URL and window", () => {
    it("TC-022-Verify the home URL has no additional path", () => {
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
    });

    it("TC-023-Verify the URL changes after navigating to /fixtures", () => {
      cy.visit("/fixtures");
      cy.url().should("include", "/fixtures");
    });

    it("TC-024-Verify the window object exists", () => {
      cy.window().should("exist");
    });

    it("TC-025-Verify window.location.pathname matches the current route", () => {
      cy.window().its("location.pathname").should("eq", "/");
    });

    it("TC-026-Verify window.document exists", () => {
      cy.window().its("document").should("exist");
    });
  });

  // ------------------------------------------------------------
  // Browser history: go back / forward / reload
  // ------------------------------------------------------------
  describe("Browser history", () => {
    it("TC-027-Verify going back returns to the previous page", () => {
      cy.visit("/fixtures");
      standingsPage.visit();
      cy.go("back");
      cy.url().should("include", "/fixtures");
    });

    it("TC-028-Verify going forward moves to the next page", () => {
      cy.visit("/fixtures");
      standingsPage.visit();
      cy.go("back");
      cy.go("forward");
      cy.url().should("include", "/standings");
    });

    it("TC-029-Verify reloading keeps the current route", () => {
      cy.visit("/fixtures");
      cy.reload();
      cy.url().should("include", "/fixtures");
    });

    it("TC-030-Verify reloading keeps the page content", () => {
      standingsPage.visit();
      cy.reload();
      standingsPage.tabla().should("exist");
    });
  });
});
