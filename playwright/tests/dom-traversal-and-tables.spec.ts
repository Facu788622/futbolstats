// ============================================================
// FEATURE: DOM Traversal and Tables
// Test cases: TC-064 to TC-099
// Cypress equivalent: cypress/e2e/dom-traversal-and-tables.cy.js
//
// Main equivalences with Cypress:
//   cy.as() (alias)        -> store the locator in a variable
//   cy.each()              -> for...of over `await locator.all()`
//   cy.wrap()              -> not needed: values are already plain JS
//   cy.invoke("text"/...)  -> textContent() / getAttribute() / inputValue() / evaluate()
//   children()             -> locator(":scope > *")
//   first/last/eq(n)       -> .first() / .last() / .nth(n)
//   find()                 -> chained locator.locator() / getByTestId()
//   filter(':contains')    -> locator.filter({ hasText })
//   parent()               -> locator("..")
//   nextAll()              -> locator("xpath=following-sibling::*")
//   cy.request()           -> the `request` fixture (through ApiClient)
//
// Note: locator.all() does NOT wait for elements to exist. Before iterating,
// wait with expect(...).toBeVisible() on the first one.
//
// Page objects: StandingsPage, PlayersPage, FixturesPage, NavbarPage,
//   LoginPage, HomePage.
// ============================================================
import { test, expect } from "./support/fixtures";

test.describe("DOM Traversal and Tables", () => {
  // ------------------------------------------------------------
  // Aliases - in Playwright, a locator stored in a variable
  // ------------------------------------------------------------
  test.describe("Aliases", () => {
    test.beforeEach(async ({ standingsPage }) => {
      await standingsPage.visit();
    });

    test("TC-064-Verify an alias on a DOM element", async ({ standingsPage }) => {
      const standingsTable = standingsPage.tabla;
      await expect(standingsTable).toBeVisible();
    });

    test("TC-065-Verify an alias on a collection of rows", async ({ standingsPage }) => {
      const rows = standingsPage.filas;
      await expect(rows.first()).toBeVisible();
      expect(await rows.count()).toBeGreaterThan(0);
    });

    test("TC-066-Verify an alias on a request result", async ({ api }) => {
      const standings = await api.get("/standings/1");
      expect(standings.status()).toBe(200);
    });

    test("TC-067-Verify an alias is reusable across multiple assertions", async ({
      standingsPage,
    }) => {
      const rows = standingsPage.filas;
      await expect(rows.first()).toContainText("1");
      await expect(rows.last()).toBeAttached();
    });
  });

  // ------------------------------------------------------------
  // Iterating over DOM collections
  // ------------------------------------------------------------
  test.describe("Iterating collections", () => {
    test("TC-068-Verify every standings row is not empty", async ({ standingsPage }) => {
      await standingsPage.visit();
      await expect(standingsPage.primeraFila).toBeVisible();
      for (const row of await standingsPage.filas.all()) {
        expect((await row.innerText()).trim()).not.toBe("");
      }
    });

    test("TC-069-Verify every player card has a name", async ({ playersPage }) => {
      await playersPage.visit();
      await expect(playersPage.tarjetas.first()).toBeVisible();
      for (const card of await playersPage.tarjetas.all()) {
        const name = await playersPage.leerNombre(card);
        expect(name.trim()).not.toBe("");
      }
    });

    test("TC-070-Verify the navbar link hrefs match the expected routes", async ({
      homePage,
      navbar,
    }) => {
      await homePage.visit();
      const expectedRoutes = ["/", "/fixtures", "/standings", "/players"];
      await expect(navbar.linksLista.first()).toBeAttached();
      const links = await navbar.linksLista.all();
      for (const [index, link] of links.entries()) {
        expect(await link.getAttribute("href")).toBe(expectedRoutes[index]);
      }
    });

    test("TC-071-Verify native iteration over the standings rows inside a callback", async ({
      standingsPage,
    }) => {
      await standingsPage.visit();
      await expect(standingsPage.primeraFila).toBeVisible();
      const texts = await standingsPage.filas.allInnerTexts();
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  // ------------------------------------------------------------
  // Wrapping values - in Playwright, values are already plain JS
  // ------------------------------------------------------------
  test.describe("Wrapping values", () => {
    test("TC-072-Verify a found row is wrapped and visible", async ({ standingsPage }) => {
      await standingsPage.visit();
      await expect(standingsPage.primeraFila).toBeVisible();
    });

    test("TC-073-Verify assertions can be chained on a wrapped object", () => {
      const data = { team: "River", points: 45 };
      expect(data.team).toBe("River");
      expect(data.points).toBeGreaterThan(0);
    });

    test("TC-074-Verify a wrapped promise resolves to its value", async () => {
      const promise = new Promise((resolve) => resolve("ok"));
      await expect(promise).resolves.toBe("ok");
    });

    test("TC-075-Verify each player card contains a name element", async ({ playersPage }) => {
      await playersPage.visit();
      await expect(playersPage.tarjetas.first()).toBeVisible();
      for (const card of await playersPage.tarjetas.all()) {
        await expect(playersPage.nombreEn(card)).toBeAttached();
      }
    });
  });

  // ------------------------------------------------------------
  // Reading values (cy.invoke)
  // ------------------------------------------------------------
  test.describe("Reading values", () => {
    test("TC-076-Verify reading the text of an element", async ({ standingsPage }) => {
      await standingsPage.visit();
      await expect(standingsPage.primeraFila).not.toBeEmpty();
      const text = await standingsPage.primeraFila.textContent();
      expect(text).toBeTruthy();
    });

    test("TC-077-Verify reading the href attribute of a link", async ({ homePage, navbar }) => {
      await homePage.visit();
      expect(await navbar.link("/fixtures").getAttribute("href")).toBe("/fixtures");
    });

    test("TC-078-Verify reading the value of an input", async ({ loginPage }) => {
      await loginPage.visit();
      await loginPage.inputEmail.fill("test@test.com");
      expect(await loginPage.inputEmail.inputValue()).toBe("test@test.com");
    });

    test("TC-079-Verify removing an attribute updates the DOM", async ({ loginPage }) => {
      await loginPage.visit();
      // Once `type` is removed, the input[type='email'] locator no longer finds
      // the element: that is why the attribute is read inside the same evaluate()
      const typeAfter = await loginPage.inputEmail.evaluate((el) => {
        el.removeAttribute("type");
        return el.getAttribute("type");
      });
      expect(typeAfter).toBeNull();
    });

    test("TC-080-Verify adding a CSS class updates the DOM", async ({ homePage, navbar }) => {
      await homePage.visit();
      await navbar.nav.evaluate((el) => el.classList.add("test-class"));
      await expect(navbar.nav).toHaveClass(/test-class/);
    });
  });

  // ------------------------------------------------------------
  // Table handling - Standings table
  // children / eq / filter / find / first / last / nextAll / parent
  // ------------------------------------------------------------
  test.describe("Standings table handling", () => {
    test.beforeEach(async ({ standingsPage }) => {
      await standingsPage.visit();
      await expect(standingsPage.tabla).toBeVisible();
    });

    test("TC-081-Verify the table body contains rows", async ({ standingsPage }) => {
      const children = standingsPage.tbody.locator(":scope > *");
      await expect(children.first()).toBeAttached();
      expect(await children.count()).toBeGreaterThan(0);
    });

    test("TC-082-Verify the first row is position 1", async ({ standingsPage }) => {
      await expect(standingsPage.primeraFila).toBeVisible();
      expect(await standingsPage.leerCelda(standingsPage.primeraFila, "position")).toBe("1");
    });

    test("TC-083-Verify the last row exists", async ({ standingsPage }) => {
      await expect(standingsPage.ultimaFila).toBeAttached();
    });

    test("TC-084-Verify selecting the row at index 0 is equivalent to selecting the first row", async ({
      standingsPage,
    }) => {
      const row = standingsPage.filas.nth(0);
      await expect(row).toBeVisible();
      expect(await standingsPage.leerCelda(row, "position")).toBe("1");
    });

    test("TC-085-Verify the row at index 2 is position 3", async ({ standingsPage }) => {
      await expect(standingsPage.celda(2, "position")).toHaveText("3");
    });

    test("TC-086-Verify a team name can be found inside the first row", async ({
      standingsPage,
    }) => {
      const team = standingsPage.obtenerPrimerEquipo();
      await expect(team).toBeAttached();
      await expect(team).not.toBeEmpty();
    });

    test("TC-087-Verify filtering rows by team name returns a single row", async ({
      standingsPage,
    }) => {
      await expect(standingsPage.filas.filter({ hasText: "River" })).toHaveCount(1);
    });

    test("TC-088-Verify the parent of a cell is the standings row", async ({
      standingsPage,
    }) => {
      const parent = standingsPage.celda(0, "points").locator("..");
      await expect(parent).toHaveAttribute("data-testid", "standings-row");
    });

    test("TC-089-Verify rows following the first row exist", async ({ standingsPage }) => {
      const following = standingsPage.primeraFila.locator("xpath=following-sibling::*");
      await expect(following.first()).toBeAttached();
      expect(await following.count()).toBeGreaterThan(0);
    });

    test("TC-090-Verify every row has a valid points value", async ({ standingsPage }) => {
      await expect(standingsPage.primeraFila).toBeVisible();
      for (const row of await standingsPage.filas.all()) {
        const points = parseInt(await standingsPage.leerCelda(row, "points"));
        expect(typeof points).toBe("number");
        expect(Number.isNaN(points)).toBe(false);
        expect(points).toBeGreaterThanOrEqual(0);
      }
    });

    test("TC-091-Verify wins x 3 + draws equals points", async ({ standingsPage }) => {
      await expect(standingsPage.primeraFila).toBeVisible();
      const row = standingsPage.primeraFila;
      const wins = parseInt(await standingsPage.leerCelda(row, "wins"));
      const draws = parseInt(await standingsPage.leerCelda(row, "draws"));
      const points = parseInt(await standingsPage.leerCelda(row, "points"));
      expect(wins * 3 + draws).toBe(points);
    });
  });

  // ------------------------------------------------------------
  // Date handling - date picker in the fixtures filter
  // Requires feature: date range filter on /fixtures
  // ------------------------------------------------------------
  test.describe("Date handling", () => {
    test.beforeEach(async ({ fixturesPage }) => {
      await fixturesPage.visit();
    });

    test("TC-092-Verify the date filter inputs exist on the fixtures page", async ({
      fixturesPage,
    }) => {
      await expect(fixturesPage.fechaDesde).toBeAttached();
      await expect(fixturesPage.fechaHasta).toBeAttached();
    });

    test('TC-093-Verify a date can be entered in the "from" input', async ({
      fixturesPage,
    }) => {
      await fixturesPage.fechaDesde.fill("2025-01-01");
      await expect(fixturesPage.fechaDesde).toHaveValue("2025-01-01");
    });

    test("TC-094-Verify a date range filters the fixtures", async ({ fixturesPage }) => {
      await fixturesPage.filtrarPorFechas("2025-01-01", "2025-06-30");
      await expect(fixturesPage.tarjetas.first()).toBeVisible();
      expect(await fixturesPage.tarjetas.count()).toBeGreaterThan(0);
    });

    test("TC-095-Verify the value of a date input can be read", async ({ fixturesPage }) => {
      await fixturesPage.fechaDesde.fill("2025-03-15");
      expect(await fixturesPage.fechaDesde.inputValue()).toBe("2025-03-15");
    });

    test("TC-096-Verify clearing the date filter empties the input", async ({
      fixturesPage,
    }) => {
      await fixturesPage.fechaDesde.fill("2025-01-01");
      await fixturesPage.fechaDesde.clear();
      await expect(fixturesPage.fechaDesde).toHaveValue("");
    });
  });

  // ------------------------------------------------------------
  // DOM analysis against JSON - request + DOM comparison
  // ------------------------------------------------------------
  test.describe("DOM analysis against API JSON", () => {
    test("TC-097-Verify the number of DOM rows matches the API standings", async ({
      api,
      standingsPage,
    }) => {
      const apiCount = (await (await api.get("/standings/1")).json()).data.length;
      await standingsPage.visit();
      await expect(standingsPage.filas).toHaveCount(apiCount);
    });

    test("TC-098-Verify the first team in the DOM matches the first team in the API", async ({
      api,
      standingsPage,
    }) => {
      const firstTeam = (await (await api.get("/standings/1")).json()).data[0].team.name;
      await standingsPage.visit();
      await expect(standingsPage.obtenerPrimerEquipo()).toContainText(firstTeam);
    });

    test("TC-099-Verify the first player name in the DOM matches the first player in the API", async ({
      api,
      playersPage,
    }) => {
      const firstPlayer = (await (await api.get("/players")).json()).data[0].name;
      await playersPage.visit();
      await expect(playersPage.nombres.first()).toContainText(firstPlayer);
    });
  });
});
