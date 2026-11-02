// ============================================================
// FEATURE: DOM Traversal and Tables
// Test cases: TC-064 to TC-099
// Playwright equivalent: playwright/tests/dom-traversal-and-tables.spec.ts
//
// Covers:
//   cy.each() / forEach
//   cy.wrap()
//   cy.invoke() and invoke + then()
//   Table handling: children / eq / filter / find / first / last / nextAll / parent
//   Date handling (date picker)
//   Aliases
//   DOM analysis against API JSON
//
// Page objects used: StandingsPage, PlayersPage, FixturesPage, NavbarPage,
//   LoginPage, HomePage
// Assertions stay in the tests; the page objects expose the queries
// (collections, rows, cells) the traversal runs on.
// ============================================================
import homePage from "../support/pages/HomePage";
import navbar from "../support/pages/NavbarPage";
import loginPage from "../support/pages/LoginPage";
import standingsPage from "../support/pages/StandingsPage";
import playersPage from "../support/pages/PlayersPage";
import fixturesPage from "../support/pages/FixturesPage";

describe("DOM Traversal and Tables", () => {
  // ------------------------------------------------------------
  // Aliases - cy.as()
  // ------------------------------------------------------------
  describe("Aliases", () => {
    beforeEach(() => {
      standingsPage.visit();
    });

    it("TC-064-Verify an alias on a DOM element", () => {
      standingsPage.tabla().as("standingsTable");
      cy.get("@standingsTable").should("be.visible");
    });

    it("TC-065-Verify an alias on a collection of rows", () => {
      standingsPage.filas().as("rows");
      cy.get("@rows").should("have.length.greaterThan", 0);
    });

    it("TC-066-Verify an alias on a request result", () => {
      cy.request("GET", "/api/standings/1").as("standings");
      cy.get("@standings").its("status").should("eq", 200);
    });

    it("TC-067-Verify an alias is reusable across multiple assertions", () => {
      standingsPage.filas().as("rows");
      cy.get("@rows").first().should("contain", "1");
      cy.get("@rows").last().should("exist");
    });
  });

  // ------------------------------------------------------------
  // Iterating over DOM collections - cy.each()
  // ------------------------------------------------------------
  describe("Iterating collections", () => {
    it("TC-068-Verify every standings row is not empty", () => {
      standingsPage.visit();
      standingsPage.filas().each(($row) => {
        expect($row.text().trim()).to.not.be.empty;
      });
    });

    it("TC-069-Verify every player card has a name", () => {
      playersPage.visit();
      playersPage.tarjetas().each(($card) => {
        const name = playersPage.leerNombre($card);
        expect(name.trim()).to.not.be.empty;
      });
    });

    it("TC-070-Verify the navbar link hrefs match the expected routes", () => {
      homePage.visit();
      const expectedRoutes = ["/", "/fixtures", "/standings", "/players"];
      navbar.linksLista().each(($link, index) => {
        expect($link.attr("href")).to.eq(expectedRoutes[index]);
      });
    });

    it("TC-071-Verify native iteration over the standings rows inside a callback", () => {
      standingsPage.visit();
      standingsPage.filas().then(($rows) => {
        const texts = [];
        $rows.each((i, el) => {
          texts.push(Cypress.$(el).text());
        });
        expect(texts.length).to.be.greaterThan(0);
      });
    });
  });

  // ------------------------------------------------------------
  // Wrapping values - cy.wrap()
  // ------------------------------------------------------------
  describe("Wrapping values", () => {
    it("TC-072-Verify a found row is wrapped and visible", () => {
      standingsPage.visit();
      standingsPage.primeraFila().then(($row) => {
        cy.wrap($row).should("be.visible");
      });
    });

    it("TC-073-Verify assertions can be chained on a wrapped object", () => {
      const data = { team: "River", points: 45 };
      cy.wrap(data).its("team").should("eq", "River");
      cy.wrap(data).its("points").should("be.greaterThan", 0);
    });

    it("TC-074-Verify a wrapped promise resolves to its value", () => {
      const promise = new Promise((resolve) => resolve("ok"));
      cy.wrap(promise).should("eq", "ok");
    });

    it("TC-075-Verify each player card contains a name element", () => {
      playersPage.visit();
      playersPage.tarjetas().each(($card) => {
        playersPage.nombreEn($card).should("exist");
      });
    });
  });

  // ------------------------------------------------------------
  // Reading values - cy.invoke()
  // ------------------------------------------------------------
  describe("Reading values", () => {
    it("TC-076-Verify reading the text of an element", () => {
      standingsPage.visit();
      standingsPage.primeraFila().invoke("text").should("not.be.empty");
    });

    it("TC-077-Verify reading the href attribute of a link", () => {
      homePage.visit();
      navbar.link("/fixtures").invoke("attr", "href").should("eq", "/fixtures");
    });

    it("TC-078-Verify reading the value of an input", () => {
      loginPage.visit();
      loginPage.inputEmail().type("test@test.com");
      loginPage.inputEmail().invoke("val").should("eq", "test@test.com");
    });

    it("TC-079-Verify removing an attribute updates the DOM", () => {
      loginPage.visit();
      loginPage
        .inputEmail()
        .invoke("removeAttr", "type")
        .then(($input) => {
          expect($input.attr("type")).to.be.undefined;
        });
    });

    it("TC-080-Verify adding a CSS class updates the DOM", () => {
      homePage.visit();
      navbar
        .nav()
        .invoke("addClass", "test-class")
        .should("have.class", "test-class");
    });
  });

  // ------------------------------------------------------------
  // Table handling - Standings table
  // children / eq / filter / find / first / last / nextAll / parent
  // ------------------------------------------------------------
  describe("Standings table handling", () => {
    beforeEach(() => {
      standingsPage.visit();
      standingsPage.tabla().as("table");
    });

    it("TC-081-Verify the table body contains rows", () => {
      standingsPage.tbody().children().should("have.length.greaterThan", 0);
    });

    it("TC-082-Verify the first row is position 1", () => {
      standingsPage.primeraFila().then(($row) => {
        expect(standingsPage.leerCelda($row, "position")).to.eq("1");
      });
    });

    it("TC-083-Verify the last row exists", () => {
      standingsPage.ultimaFila().should("exist");
    });

    it("TC-084-Verify selecting the row at index 0 is equivalent to selecting the first row", () => {
      standingsPage.filas().eq(0).then(($row) => {
        expect(standingsPage.leerCelda($row, "position")).to.eq("1");
      });
    });

    it("TC-085-Verify the row at index 2 is position 3", () => {
      standingsPage.celda(2, "position").should("have.text", "3");
    });

    it("TC-086-Verify a team name can be found inside the first row", () => {
      standingsPage
        .obtenerPrimerEquipo()
        .should("exist")
        .and("not.be.empty");
    });

    it("TC-087-Verify filtering rows by team name returns a single row", () => {
      standingsPage
        .filas()
        .filter(':contains("River")')
        .should("have.length", 1);
    });

    it("TC-088-Verify the parent of a cell is the standings row", () => {
      standingsPage
        .celda(0, "points")
        .parent()
        .should("have.attr", "data-testid", "standings-row");
    });

    it("TC-089-Verify rows following the first row exist", () => {
      standingsPage
        .primeraFila()
        .nextAll()
        .should("have.length.greaterThan", 0);
    });

    it("TC-090-Verify every row has a valid points value", () => {
      standingsPage.filas().each(($row) => {
        const points = parseInt(standingsPage.leerCelda($row, "points"));
        expect(points).to.be.a("number");
        expect(points).to.be.gte(0);
      });
    });

    it("TC-091-Verify wins x 3 + draws equals points", () => {
      standingsPage.primeraFila().then(($row) => {
        const wins = parseInt(standingsPage.leerCelda($row, "wins"));
        const draws = parseInt(standingsPage.leerCelda($row, "draws"));
        const points = parseInt(standingsPage.leerCelda($row, "points"));
        expect(wins * 3 + draws).to.eq(points);
      });
    });
  });

  // ------------------------------------------------------------
  // Date handling - date picker in the fixtures filter
  // Requires feature: date range filter on /fixtures
  // ------------------------------------------------------------
  describe("Date handling", () => {
    beforeEach(() => {
      fixturesPage.visit();
    });

    it("TC-092-Verify the date filter inputs exist on the fixtures page", () => {
      fixturesPage.fechaDesde().should("exist");
      fixturesPage.fechaHasta().should("exist");
    });

    it('TC-093-Verify a date can be entered in the "from" input', () => {
      fixturesPage.fechaDesde().type("2025-01-01");
      fixturesPage.fechaDesde().should("have.value", "2025-01-01");
    });

    it("TC-094-Verify a date range filters the fixtures", () => {
      fixturesPage.filtrarPorFechas("2025-01-01", "2025-06-30");
      fixturesPage.tarjetas().should("have.length.greaterThan", 0);
    });

    it("TC-095-Verify the value of a date input can be read", () => {
      fixturesPage.fechaDesde().type("2025-03-15");
      fixturesPage.fechaDesde().invoke("val").should("eq", "2025-03-15");
    });

    it("TC-096-Verify clearing the date filter empties the input", () => {
      fixturesPage.fechaDesde().type("2025-01-01");
      fixturesPage.fechaDesde().clear();
      fixturesPage.fechaDesde().should("have.value", "");
    });
  });

  // ------------------------------------------------------------
  // DOM analysis against JSON - cy.request + DOM comparison
  // ------------------------------------------------------------
  describe("DOM analysis against API JSON", () => {
    it("TC-097-Verify the number of DOM rows matches the API standings", () => {
      cy.request("GET", "/api/standings/1").then((response) => {
        const apiCount = response.body.data.length;
        standingsPage.visit();
        standingsPage.filas().should("have.length", apiCount);
      });
    });

    it("TC-098-Verify the first team in the DOM matches the first team in the API", () => {
      cy.request("GET", "/api/standings/1").then((response) => {
        const firstTeam = response.body.data[0].team.name;
        standingsPage.visit();
        standingsPage
          .obtenerPrimerEquipo()
          .invoke("text")
          .should("include", firstTeam);
      });
    });

    it("TC-099-Verify the first player name in the DOM matches the first player in the API", () => {
      cy.request("GET", "/api/players").then((response) => {
        const firstPlayer = response.body.data[0].name;
        playersPage.visit();
        playersPage
          .nombres()
          .first()
          .invoke("text")
          .should("include", firstPlayer);
      });
    });
  });
});
