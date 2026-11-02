// ============================================================
// FEATURE: Session, Network and Test Data
// Test cases: TC-100 to TC-129
// Cypress equivalent: cypress/e2e/session-network-and-test-data.cy.js
//
// Main equivalences with Cypress:
//   cy.session()           -> fixtures `paginaAdmin` / `paginaViewer` (tests/support/fixtures.ts)
//   cy.request()           -> the `request` / `api` fixtures
//   cy.intercept()         -> page.route() (stub / abort) and page.waitForResponse() (spy)
//   JSON fixtures          -> import of tests/data/*.json
//   custom commands        -> Playwright fixtures (+ page objects)
//   Page Object Model      -> classes in tests/pages/*
//   selectFile()           -> locator.setInputFiles()
//   faker                  -> @faker-js/faker (same)
//
// Responsibilities:
//   tests/data/       -> test data and stubs
//   tests/support/fixtures.ts -> sessions and page objects handed to each test
//   tests/pages/      -> locators, navigation and actions per page
//   tests             -> intent and assertions
// ============================================================
import { faker } from "@faker-js/faker";
import { test, expect } from "./support/fixtures";
import usuarioAdmin from "./data/usuario-admin.json";
import usuarioRegular from "./data/usuario-regular.json";
import standingsStub from "./data/standings.json";

test.describe("Session, Network and Test Data", () => {
  // ------------------------------------------------------------
  // Sessions - equivalent to cy.session()
  // The `paginaAdmin` fixture logs in through the UI before the test runs.
  // ------------------------------------------------------------
  test.describe("Sessions", () => {
    test("TC-100-Verify an admin session can access the admin page", async ({
      paginaAdmin,
      adminPage,
    }) => {
      await adminPage.visit();
      await expect(paginaAdmin).toHaveURL(/\/admin/);
    });

    test("TC-101-Verify an admin session displays the admin panel", async ({
      paginaAdmin,
      adminPage,
    }) => {
      await adminPage.visit();
      await expect(adminPage.panel).toBeVisible();
    });

    test("TC-102-Verify a regular user session cannot access the admin page", async ({
      paginaViewer,
      adminPage,
    }) => {
      await adminPage.visit();
      await expect(paginaViewer).not.toHaveURL(/\/admin/);
    });
  });

  // ------------------------------------------------------------
  // Direct HTTP requests
  // (does not interact with the UI, does not use page objects)
  // ------------------------------------------------------------
  test.describe("Direct HTTP requests", () => {
    test("TC-103-Verify GET /api/standings/1 returns 200", async ({ request }) => {
      const res = await request.get("/api/standings/1");
      expect(res.status()).toBe(200);
    });

    test("TC-104-Verify GET /api/fixtures returns an array of fixtures", async ({ request }) => {
      const res = await request.get("/api/fixtures");
      const body = await res.json();
      expect(res.status()).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    test("TC-105-Verify GET /api/players returns players with the expected properties", async ({
      request,
    }) => {
      const body = await (await request.get("/api/players")).json();
      const firstPlayer = body.data[0];
      expect(firstPlayer).toHaveProperty("name");
      expect(firstPlayer).toHaveProperty("position");
      expect(firstPlayer).toHaveProperty("team_id");
    });

    test("TC-106-Verify POST /api/auth/login with valid credentials returns a token", async ({
      request,
    }) => {
      const res = await request.post("/api/auth/login", {
        data: { email: "admin@futbolstats.com", password: "admin1234" },
      });
      const body = await res.json();
      expect(res.status()).toBe(200);
      expect(body.data).toHaveProperty("token");
    });

    test("TC-107-Verify POST /api/auth/login with invalid credentials returns 401", async ({
      request,
    }) => {
      const res = await request.post("/api/auth/login", {
        data: { email: "noexiste@test.com", password: "wrongpass" },
      });
      expect(res.status()).toBe(401);
    });

    test("TC-108-Verify POST to a protected endpoint without a token returns 401", async ({
      request,
    }) => {
      const res = await request.post("/api/fixtures", { data: {} });
      expect(res.status()).toBe(401);
    });

    test("TC-109-Verify the full structure of the fixture detail response", async ({
      request,
    }) => {
      const fixtureOne = await request.get("/api/fixtures/1");
      const body = await fixtureOne.json();
      expect(body.data).toHaveProperty("id", 1);
      expect(body.data).toHaveProperty("home_team_id");
      expect(body.data).toHaveProperty("away_team_id");
      expect(body.data.home_team_id).not.toBe(body.data.away_team_id);
    });
  });

  // ------------------------------------------------------------
  // Network interception (cy.intercept)
  //   spy   -> page.waitForResponse() (set up BEFORE the action)
  //   stub  -> page.route() + route.fulfill()
  //   error -> page.route() + route.abort()
  // ------------------------------------------------------------
  test.describe("Network interception", () => {
    test("TC-110-Verify the fixtures API call completes before interacting", async ({
      page,
      fixturesPage,
    }) => {
      const response = page.waitForResponse(
        (r) => r.url().includes("/api/fixtures") && r.request().method() === "GET",
      );
      await fixturesPage.visit();
      expect([200, 304]).toContain((await response).status());
    });

    test("TC-111-Verify the standings page calls the correct endpoint", async ({
      page,
      standingsPage,
    }) => {
      const response = page.waitForResponse(
        (r) => r.url().includes("/api/standings/") && r.request().method() === "GET",
      );
      await standingsPage.visit();
      expect([200, 304]).toContain((await response).status());
    });

    test("TC-112-Verify filtering players by position calls the API with that position", async ({
      page,
      playersPage,
    }) => {
      const initialLoad = page.waitForResponse((r) => r.url().includes("/api/players"));
      await playersPage.visit();
      await initialLoad;

      const filtered = page.waitForResponse(
        (r) => r.url().includes("/api/players") && r.url().includes("position=FWD"),
      );
      await playersPage.filtrarPorPosicion("FWD");
      expect((await filtered).url()).toContain("position=FWD");
    });

    test("TC-113-Verify stubbing the standings response with a local fixture", async ({
      page,
      standingsPage,
    }) => {
      await page.route("**/api/standings/1", (route) => route.fulfill({ json: standingsStub }));
      await standingsPage.visit();
      await expect(standingsPage.primeraFila).toBeVisible();
      expect(await standingsPage.filas.count()).toBeGreaterThan(0);
    });

    test("TC-114-Verify the fixtures page shows an error on a network failure", async ({
      page,
      fixturesPage,
    }) => {
      await page.route("**/api/fixtures*", (route) => route.abort());
      await fixturesPage.visit();
      await expect(fixturesPage.mensajeError).toBeVisible();
    });

    test("TC-115-Verify a modified standings response is reflected in the UI", async ({
      page,
      standingsPage,
    }) => {
      const standings = structuredClone(standingsStub);
      standings.data[0].points = 999;
      await page.route("**/api/standings/1", (route) => route.fulfill({ json: standings }));

      await standingsPage.visit();
      await expect(standingsPage.celda(0, "points")).toHaveText("999");
    });
  });

  // ------------------------------------------------------------
  // Test data - files in tests/data/
  //   usuario-admin.json, usuario-regular.json, standings.json
  // ------------------------------------------------------------
  test.describe("Test data", () => {
    test("TC-116-Verify login with credentials loaded from a JSON fixture", async ({
      page,
      loginPage,
    }) => {
      await loginPage.login(usuarioAdmin.email, usuarioAdmin.password);
      await expect(page).not.toHaveURL(/\/login/);
    });

    test("TC-117-Verify stubbing the standings API with a JSON fixture", async ({
      page,
      standingsPage,
    }) => {
      const response = page.waitForResponse("**/api/standings/1");
      await page.route("**/api/standings/1", (route) => route.fulfill({ json: standingsStub }));
      await standingsPage.visit();
      await response;
    });

    test("TC-118-Verify a regular user fixture cannot access the admin page", async ({
      page,
      loginPage,
      adminPage,
    }) => {
      await loginPage.login(usuarioRegular.email, usuarioRegular.password);
      await adminPage.visit();
      await expect(page).not.toHaveURL(/\/admin/);
    });
  });

  // ------------------------------------------------------------
  // Custom commands -> Playwright fixtures
  //   cy.loginComoAdmin() -> paginaAdmin
  //   cy.cerrarSesion()   -> navbar.botonLogout
  //   cy.login(e, p)      -> loginPage.login(e, p)
  // ------------------------------------------------------------
  test.describe("Custom commands", () => {
    test.skip("TC-119-Verify the admin login command opens the admin panel", async ({
      paginaAdmin,
      adminPage,
    }) => {
      await adminPage.visit();
      await expect(adminPage.panel).toBeVisible();
    });

    test.skip("TC-120-Verify the logout command returns to the login page", async ({
      paginaAdmin,
      navbar,
    }) => {
      await navbar.botonLogout.click();
      await expect(paginaAdmin).toHaveURL(/\/login/);
    });

    test("TC-121-Verify login with dynamic credentials", async ({ page, loginPage }) => {
      await loginPage.login(usuarioAdmin.email, usuarioAdmin.password);
      await expect(page).not.toHaveURL(/\/login/);
    });
  });

  // ------------------------------------------------------------
  // Page Object Model
  // The page objects live in tests/pages/ and are handed out by tests/support/fixtures.ts
  // ------------------------------------------------------------
  test.describe("Page Object Model", () => {
    test("TC-122-Verify the login page object encapsulates the login form interaction", async ({
      page,
      loginPage,
    }) => {
      await loginPage.visit();
      await loginPage.completarFormulario("admin@futbolstats.com", "admin1234");
      await loginPage.submit();
      await expect(page).not.toHaveURL(/\/login/);
    });

    test("TC-123-Verify the standings page object encapsulates reading the table", async ({
      standingsPage,
    }) => {
      await standingsPage.visit();
      await expect(standingsPage.obtenerPrimerEquipo()).toBeAttached();
    });
  });

  // ------------------------------------------------------------
  // File upload - upload an image from the admin panel
  // Requires feature: file input in the admin player/team edit form
  // ------------------------------------------------------------
  test.describe("File upload", () => {
    test.beforeEach(async ({ paginaAdmin, adminPage }) => {
      await adminPage.visit();
    });

    test("TC-124-Verify the file input exists in the player edit form", async ({
      adminPage,
    }) => {
      await adminPage.editarUltimoJugador();
      await expect(adminPage.inputArchivo).toBeAttached();
    });

    test.skip("TC-125-Verify uploading an image in the player edit form shows a preview", async ({
      page,
      adminPage,
    }) => {
      await adminPage.editarUltimoJugador();
      // The path is relative to the playwright/ folder (where tests are run from)
      await adminPage.inputArchivo.setInputFiles("tests/data/imagen-jugador.jpg");
      await expect(page.getByTestId("file-preview")).toBeVisible();
    });

    test("TC-126-Verify the file input accepts only images", async ({ adminPage }) => {
      await adminPage.editarUltimoJugador();
      await expect(adminPage.inputArchivo).toHaveAttribute("accept", /image\//);
    });
  });

  // ------------------------------------------------------------
  // Faker - dynamic data in tests
  // ------------------------------------------------------------
  test.describe("Faker data generation", () => {
    test.skip("TC-127-Verify registering with a generated email through the UI", async ({
      page,
    }) => {
      const email = faker.internet.email();
      const password = faker.internet.password({ length: 8 });

      await page.goto("/register");
      await page.locator("input[type='email']").fill(email);
      await page.locator("input[type='password']").fill(password);
      await page.locator("button[type='submit']").click();
      await expect(page).not.toHaveURL(/\/register/);
    });

    test("TC-128-Verify a generated email avoids conflicts across executions", async ({
      request,
    }) => {
      const email = faker.internet.email();
      const res = await request.post("/api/auth/register", {
        data: { email, password: "Test1234!" },
      });
      expect(res.status()).toBe(201);
    });

    test("TC-129-Verify registering two users with generated emails does not conflict", async ({
      request,
    }) => {
      const email1 = faker.internet.email();
      const email2 = faker.internet.email();
      expect(email1).not.toBe(email2);

      const res1 = await request.post("/api/auth/register", {
        data: { email: email1, password: "Pass1234!" },
      });
      expect(res1.status()).toBe(201);

      const res2 = await request.post("/api/auth/register", {
        data: { email: email2, password: "Pass1234!" },
      });
      expect(res2.status()).toBe(201);
    });
  });
});
