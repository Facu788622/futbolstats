// ============================================================
// FEATURE: Forms and User Interactions
// Test cases: TC-031 to TC-063
// Cypress equivalent: cypress/e2e/forms-and-user-interactions.cy.js
//
// Main equivalences with Cypress:
//   cy.type()            -> locator.fill() / pressSequentially() / press()
//   {enter}              -> press("Enter")
//   {selectAll}          -> press("Control+A")
//   {backspace}          -> press("Backspace")
//   type({delay})        -> pressSequentially(text, { delay })
//   clear()              -> locator.clear()
//   click({force})       -> click({ force: true })
//   cy.select()          -> locator.selectOption()
//   check()/uncheck()    -> locator.check() / uncheck()
//   trigger("change")    -> locator.fill() on a slider (fires input and change)
//   trigger("mouseover") -> locator.hover()
//   drag & drop          -> locator.dragTo()
//   should vs expect     -> expect(locator) web-first vs expect(value) generic
//
// Page objects: LoginPage, NavbarPage, HomePage, StandingsPage, PlayersPage,
//   FixturesPage, AdminPage. Assertions stay in the tests.
// ============================================================
import { test, expect } from "./support/fixtures";

test.describe("Forms and User Interactions", () => {
  // ------------------------------------------------------------
  // Typing into inputs
  // ------------------------------------------------------------
  test.describe("Typing", () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.visit();
    });

    test("TC-031-Verify typing an email into the email field", async ({ loginPage }) => {
      await loginPage.inputEmail.pressSequentially("admin@futbolstats.com");
      await expect(loginPage.inputEmail).toHaveValue("admin@futbolstats.com");
    });

    test("TC-032-Verify typing a password into the password field", async ({ loginPage }) => {
      await loginPage.inputPassword.pressSequentially("admin1234");
      await expect(loginPage.inputPassword).toHaveValue("admin1234");
    });

    test("TC-033-Verify pressing Enter submits the login form", async ({
      page,
      loginPage,
    }) => {
      await loginPage.inputEmail.pressSequentially("admin@futbolstats.com");
      await loginPage.inputPassword.pressSequentially("admin1234");
      await loginPage.inputPassword.press("Enter");
      await expect(page).not.toHaveURL(/\/login/);
    });

    test("TC-034-Verify select-all replaces the existing text", async ({ loginPage }) => {
      await loginPage.inputEmail.pressSequentially("initial-text");
      await loginPage.inputEmail.press("Control+A");
      await loginPage.inputEmail.pressSequentially("admin@futbolstats.com");
      await expect(loginPage.inputEmail).toHaveValue("admin@futbolstats.com");
    });

    test("TC-035-Verify backspace removes characters", async ({ loginPage }) => {
      await loginPage.inputEmail.pressSequentially("admin@futbolstats.co");
      await loginPage.inputEmail.pressSequentially("x");
      await loginPage.inputEmail.press("Backspace");
      await loginPage.inputEmail.pressSequentially("m");
      await expect(loginPage.inputEmail).toHaveValue("admin@futbolstats.com");
    });

    test("TC-036-Verify typing with a delay simulates human input", async ({ loginPage }) => {
      await loginPage.inputEmail.pressSequentially("admin@futbolstats.com", { delay: 50 });
      await expect(loginPage.inputEmail).toHaveValue("admin@futbolstats.com");
    });
  });

  // ------------------------------------------------------------
  // Clearing inputs
  // ------------------------------------------------------------
  test.describe("Clearing inputs", () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.visit();
    });

    test("TC-037-Verify clearing empties the email field", async ({ loginPage }) => {
      await loginPage.inputEmail.fill("text-to-delete");
      await loginPage.inputEmail.clear();
      await expect(loginPage.inputEmail).toHaveValue("");
    });

    test("TC-038-Verify clearing and retyping replaces the field value", async ({
      loginPage,
    }) => {
      await loginPage.inputEmail.fill("wrong-value");
      await loginPage.inputEmail.clear();
      await loginPage.inputEmail.fill("admin@futbolstats.com");
      await expect(loginPage.inputEmail).toHaveValue("admin@futbolstats.com");
    });
  });

  // ------------------------------------------------------------
  // Clicking and its variants
  // ------------------------------------------------------------
  test.describe("Clicking", () => {
    test("TC-039-Verify clicking the navbar link navigates to fixtures", async ({
      page,
      homePage,
      navbar,
    }) => {
      await homePage.visit();
      await navbar.clickEnLink("/fixtures");
      await expect(page).toHaveURL(/\/fixtures/);
    });

    test("TC-040-Verify clicking the navbar link navigates to standings", async ({
      page,
      homePage,
      navbar,
    }) => {
      await homePage.visit();
      await navbar.clickEnLink("/standings");
      await expect(page).toHaveURL(/\/standings/);
    });

    test("TC-041-Verify clicking the navbar link navigates to players", async ({
      page,
      homePage,
      navbar,
    }) => {
      await homePage.visit();
      await navbar.clickEnLink("/players");
      await expect(page).toHaveURL(/\/players/);
    });

    test("TC-042-Verify clicking login submits the form with valid credentials", async ({
      page,
      loginPage,
    }) => {
      await loginPage.visit();
      await loginPage.completarFormulario("admin@futbolstats.com", "admin1234");
      await loginPage.submit();
      await expect(page).not.toHaveURL(/\/login/);
    });

    test("TC-043-Verify a forced click works on a potentially covered element", async ({
      loginPage,
    }) => {
      await loginPage.visit();
      await loginPage.botonSubmit.click({ force: true });
    });

    test("TC-044-Verify clicking a fixture card navigates to the fixture detail", async ({
      page,
      fixturesPage,
    }) => {
      await fixturesPage.visit();
      await fixturesPage.primeraTarjeta.click();
      await expect(page).toHaveURL(/\/fixtures\/\d+/);
    });

    test("TC-045-Verify clicking a team name navigates to the team detail", async ({
      page,
      standingsPage,
    }) => {
      await standingsPage.visit();
      await standingsPage.linksEquipos.first().click();
      await expect(page).toHaveURL(/\/teams\/\d+/);
    });
  });

  // ------------------------------------------------------------
  // Dropdown selection
  // ------------------------------------------------------------
  test.describe("Dropdown selection", () => {
    test.beforeEach(async ({ playersPage }) => {
      await playersPage.visit();
    });

    test("TC-046-Verify filtering players by position GK", async ({ playersPage }) => {
      await playersPage.filtrarPorPosicion("GK");
      await expect(playersPage.filtroPosicion).toHaveValue("GK");
    });

    test("TC-047-Verify filtering players by position DEF", async ({ playersPage }) => {
      await playersPage.filtrarPorPosicion("DEF");
      await expect(playersPage.filtroPosicion).toHaveValue("DEF");
    });

    test("TC-048-Verify filtering players by position MID", async ({ playersPage }) => {
      await playersPage.filtrarPorPosicion("MID");
      await expect(playersPage.filtroPosicion).toHaveValue("MID");
    });

    test("TC-049-Verify filtering players by position FWD", async ({ playersPage }) => {
      await playersPage.filtrarPorPosicion("FWD");
      await expect(playersPage.filtroPosicion).toHaveValue("FWD");
    });

    test("TC-050-Verify selecting an option by visible text works like selecting by value", async ({
      playersPage,
    }) => {
      await playersPage.filtrarPorPosicion("Todos");
      await expect(playersPage.tarjetas.first()).toBeVisible();
      expect(await playersPage.tarjetas.count()).toBeGreaterThan(0);
    });
  });

  // ------------------------------------------------------------
  // Checkboxes
  // Requires feature: admin checkbox (e.g. mark a fixture as featured)
  // ------------------------------------------------------------
  test.describe("Checkboxes", () => {
    // `paginaAdmin` logs in as admin before each test
    test.beforeEach(async ({ paginaAdmin, adminPage }) => {
      await adminPage.visit();
    });

    test.skip("TC-051-Verify checking a checkbox marks it", async ({ adminPage }) => {
      await adminPage.checkboxesDestacado.first().check();
      await expect(adminPage.checkboxesDestacado.first()).toBeChecked();
    });

    test.skip("TC-052-Verify unchecking a checkbox clears it", async ({ adminPage }) => {
      await adminPage.checkboxesDestacado.first().check();
      await adminPage.checkboxesDestacado.first().uncheck();
      await expect(adminPage.checkboxesDestacado.first()).not.toBeChecked();
    });

    test.skip("TC-053-Verify checking a checkbox by value in a checkbox group", async ({
      adminPage,
    }) => {
      await adminPage.checkboxPorValor("destacado").check();
      await expect(adminPage.checkboxPorValor("destacado")).toBeChecked();
    });
  });

  // ------------------------------------------------------------
  // Sliders and mouse events
  // Requires feature: minute filter slider in the fixture events
  // fill() on a range input fires the input and change events
  // ------------------------------------------------------------
  test.describe("Sliders and mouse events", () => {
    test("TC-054-Verify the change event on the minute slider updates its value", async ({
      fixturesPage,
    }) => {
      await fixturesPage.visitarDetalle(1);
      await fixturesPage.sliderMinuto.fill("45");
      await expect(fixturesPage.sliderMinuto).toHaveValue("45");
    });

    test("TC-055-Verify the input event on the minute slider updates the displayed minute", async ({
      fixturesPage,
    }) => {
      await fixturesPage.visitarDetalle(1);
      await fixturesPage.sliderMinuto.fill("90");
      await expect(fixturesPage.valorMinuto).toContainText("90");
    });

    test("TC-056-Verify hovering a fixture card triggers the mouseover event", async ({
      fixturesPage,
    }) => {
      await fixturesPage.visit();
      await fixturesPage.primeraTarjeta.hover();
    });
  });

  // ------------------------------------------------------------
  // Drag and drop
  // Requires feature: drag and drop in the admin panel
  // ------------------------------------------------------------
  test.describe("Drag and drop", () => {
    test.beforeEach(async ({ paginaAdmin, adminPage }) => {
      await adminPage.visit();
    });

    test.skip("TC-057-Verify dragging and dropping reorders items in the admin panel", async ({
      adminPage,
    }) => {
      const source = adminPage.itemsArrastrables.first();
      const target = adminPage.itemsArrastrables.last();

      // Capture the text of the first item BEFORE dragging
      const originalText = await source.innerText();
      await source.dragTo(target);

      await expect(adminPage.itemsArrastrables.first()).not.toHaveText(originalText);
    });
  });

  // ------------------------------------------------------------
  // Assertions: web-first (expect(locator)) vs generic (expect(value))
  // ------------------------------------------------------------
  test.describe("Assertions: web-first vs generic", () => {
    test("TC-058-Verify chained assertions on the navbar", async ({ homePage, navbar }) => {
      await homePage.visit();
      await expect(navbar.nav).toBeVisible();
      await expect(navbar.nav).toBeAttached();
      await expect(navbar.links.first()).toBeVisible();
      expect(await navbar.links.count()).toBeGreaterThan(1);
    });

    test("TC-059-Verify multiple chained assertions on the email input", async ({ loginPage }) => {
      await loginPage.visit();
      await expect(loginPage.inputEmail).toBeAttached();
      await expect(loginPage.inputEmail).toBeVisible();
      await expect(loginPage.inputEmail).toBeEnabled();
    });

    test("TC-060-Verify the standings table is visible and exists", async ({
      standingsPage,
    }) => {
      await standingsPage.visit();
      await expect(standingsPage.tabla).toBeVisible();
      expect(await standingsPage.tabla.count()).toBe(1);
      expect(await standingsPage.tabla.isVisible()).toBe(true);
    });

    test("TC-061-Verify the players count is within the expected range", async ({
      playersPage,
    }) => {
      await playersPage.visit();
      await expect(playersPage.tarjetas.first()).toBeVisible();
      const count = await playersPage.tarjetas.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(100);
    });

    test("TC-062-Verify a negated assertion on the email input value", async ({ loginPage }) => {
      await loginPage.visit();
      await expect(loginPage.inputEmail).not.toHaveValue("something");
    });

    test("TC-063-Verify nested assertions on the first standings row", async ({
      standingsPage,
    }) => {
      await standingsPage.visit();
      await expect(standingsPage.primeraFila).toBeVisible();
      const position = await standingsPage.leerCelda(standingsPage.primeraFila, "position");
      expect(parseInt(position)).toBe(1);
    });
  });
});
