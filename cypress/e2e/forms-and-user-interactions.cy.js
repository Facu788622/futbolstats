// ============================================================
// FEATURE: Forms and User Interactions
// Test cases: TC-031 to TC-063
// Playwright equivalent: playwright/tests/forms-and-user-interactions.spec.ts
//
// Covers:
//   cy.type() and its variants
//   cy.click() and its variants
//   cy.select()
//   cy.check()
//   clear()
//   cy.trigger(), sliders
//   Mouse events
//   Assertions: should vs expect
//
// Page objects used: LoginPage, NavbarPage, HomePage, StandingsPage,
//   PlayersPage, FixturesPage, AdminPage
// Page objects return elements / run actions; the assertions
// (should / expect) stay in the tests.
// ============================================================
import loginPage from "../support/pages/LoginPage";
import navbar from "../support/pages/NavbarPage";
import homePage from "../support/pages/HomePage";
import standingsPage from "../support/pages/StandingsPage";
import playersPage from "../support/pages/PlayersPage";
import fixturesPage from "../support/pages/FixturesPage";
import adminPage from "../support/pages/AdminPage";

describe("Forms and User Interactions", () => {
  // ------------------------------------------------------------
  // Typing into inputs
  // ------------------------------------------------------------
  describe("Typing", () => {
    beforeEach(() => {
      loginPage.visit();
    });

    it("TC-031-Verify typing an email into the email field", () => {
      loginPage.inputEmail().type("admin@futbolstats.com");
      loginPage.inputEmail().should("have.value", "admin@futbolstats.com");
    });

    it("TC-032-Verify typing a password into the password field", () => {
      loginPage.inputPassword().type("admin1234");
      loginPage.inputPassword().should("have.value", "admin1234");
    });

    it("TC-033-Verify pressing Enter submits the login form", () => {
      loginPage.inputEmail().type("admin@futbolstats.com");
      loginPage.inputPassword().type("admin1234{enter}");
      cy.url().should("not.include", "/login");
    });

    it("TC-034-Verify select-all replaces the existing text", () => {
      loginPage.inputEmail().type("initial-text");
      loginPage.inputEmail().type("{selectAll}admin@futbolstats.com");
      loginPage.inputEmail().should("have.value", "admin@futbolstats.com");
    });

    it("TC-035-Verify backspace removes characters", () => {
      loginPage.inputEmail().type("admin@futbolstats.co");
      loginPage.inputEmail().type("x{backspace}m");
      loginPage.inputEmail().should("have.value", "admin@futbolstats.com");
    });

    it("TC-036-Verify typing with a delay simulates human input", () => {
      loginPage.inputEmail().type("admin@futbolstats.com", { delay: 50 });
      loginPage.inputEmail().should("have.value", "admin@futbolstats.com");
    });
  });

  // ------------------------------------------------------------
  // Clearing inputs
  // ------------------------------------------------------------
  describe("Clearing inputs", () => {
    beforeEach(() => {
      loginPage.visit();
    });

    it("TC-037-Verify clearing empties the email field", () => {
      loginPage.inputEmail().type("text-to-delete");
      loginPage.inputEmail().clear();
      loginPage.inputEmail().should("have.value", "");
    });

    it("TC-038-Verify clearing and retyping replaces the field value", () => {
      loginPage.inputEmail().type("wrong-value");
      loginPage.inputEmail().clear().type("admin@futbolstats.com");
      loginPage.inputEmail().should("have.value", "admin@futbolstats.com");
    });
  });

  // ------------------------------------------------------------
  // Clicking and its variants
  // ------------------------------------------------------------
  describe("Clicking", () => {
    it("TC-039-Verify clicking the navbar link navigates to fixtures", () => {
      homePage.visit();
      navbar.clickEnLink("/fixtures");
      cy.url().should("include", "/fixtures");
    });

    it("TC-040-Verify clicking the navbar link navigates to standings", () => {
      homePage.visit();
      navbar.clickEnLink("/standings");
      cy.url().should("include", "/standings");
    });

    it("TC-041-Verify clicking the navbar link navigates to players", () => {
      homePage.visit();
      navbar.clickEnLink("/players");
      cy.url().should("include", "/players");
    });

    it("TC-042-Verify clicking login submits the form with valid credentials", () => {
      loginPage.visit();
      loginPage.completarFormulario("admin@futbolstats.com", "admin1234");
      loginPage.submit();
      cy.url().should("not.include", "/login");
    });

    it("TC-043-Verify a forced click works on a potentially covered element", () => {
      loginPage.visit();
      loginPage.botonSubmit().click({ force: true });
    });

    it("TC-044-Verify clicking a fixture card navigates to the fixture detail", () => {
      fixturesPage.visit();
      fixturesPage.primeraTarjeta().click();
      cy.url().should("match", /\/fixtures\/\d+/);
    });

    it("TC-045-Verify clicking a team name navigates to the team detail", () => {
      standingsPage.visit();
      standingsPage.linksEquipos().first().click();
      cy.url().should("match", /\/teams\/\d+/);
    });
  });

  // ------------------------------------------------------------
  // Dropdown selection
  // ------------------------------------------------------------
  describe("Dropdown selection", () => {
    beforeEach(() => {
      playersPage.visit();
    });

    it("TC-046-Verify filtering players by position GK", () => {
      playersPage.filtrarPorPosicion("GK");
      playersPage.filtroPosicion().should("have.value", "GK");
    });

    it("TC-047-Verify filtering players by position DEF", () => {
      playersPage.filtrarPorPosicion("DEF");
      playersPage.filtroPosicion().should("have.value", "DEF");
    });

    it("TC-048-Verify filtering players by position MID", () => {
      playersPage.filtrarPorPosicion("MID");
      playersPage.filtroPosicion().should("have.value", "MID");
    });

    it("TC-049-Verify filtering players by position FWD", () => {
      playersPage.filtrarPorPosicion("FWD");
      playersPage.filtroPosicion().should("have.value", "FWD");
    });

    it("TC-050-Verify selecting an option by visible text works like selecting by value", () => {
      playersPage.filtrarPorPosicion("Todos");
      playersPage.tarjetas().should("have.length.greaterThan", 0);
    });
  });

  // ------------------------------------------------------------
  // Checkboxes
  // Requires feature: admin checkbox (e.g. mark a fixture as featured)
  // ------------------------------------------------------------
  describe("Checkboxes", () => {
    beforeEach(() => {
      loginPage.login("admin@futbolstats.com", "admin1234");
      adminPage.visit();
    });

    it.skip("TC-051-Verify checking a checkbox marks it", () => {
      adminPage.checkboxesDestacado().first().check();
      adminPage.checkboxesDestacado().first().should("be.checked");
    });

    it.skip("TC-052-Verify unchecking a checkbox clears it", () => {
      adminPage.checkboxesDestacado().first().check();
      adminPage.checkboxesDestacado().first().uncheck();
      adminPage.checkboxesDestacado().first().should("not.be.checked");
    });

    it.skip("TC-053-Verify checking a checkbox by value in a checkbox group", () => {
      adminPage.checkboxPorValor("destacado").check();
      adminPage.checkboxPorValor("destacado").should("be.checked");
    });
  });

  // ------------------------------------------------------------
  // Sliders and mouse events
  // Requires feature: minute filter slider in the fixture events
  // ------------------------------------------------------------
  describe("Sliders and mouse events", () => {
    it("TC-054-Verify the change event on the minute slider updates its value", () => {
      fixturesPage.visitarDetalle(1);
      fixturesPage.sliderMinuto().invoke("val", 45).trigger("change");
      fixturesPage.sliderMinuto().should("have.value", "45");
    });

    it("TC-055-Verify the input event on the minute slider updates the displayed minute", () => {
      fixturesPage.visitarDetalle(1);
      fixturesPage.sliderMinuto().invoke("val", 90).trigger("input");
      fixturesPage.valorMinuto().should("contain", "90");
    });

    it("TC-056-Verify hovering a fixture card triggers the mouseover event", () => {
      fixturesPage.visit();
      fixturesPage.primeraTarjeta().trigger("mouseover");
    });
  });

  // ------------------------------------------------------------
  // Drag and drop
  // Requires feature: drag and drop in the admin panel
  // ------------------------------------------------------------
  describe("Drag and drop", () => {
    beforeEach(() => {
      loginPage.login("admin@futbolstats.com", "admin1234");
      adminPage.visit();
    });

    it.skip("TC-057-Verify dragging and dropping reorders items in the admin panel", () => {
      adminPage.itemsArrastrables().first().as("source");
      adminPage.itemsArrastrables().last().as("target");

      // Capture the text of the first item BEFORE dragging
      adminPage
        .itemsArrastrables()
        .first()
        .invoke("text")
        .then((originalText) => {
          cy.get("@source").trigger("dragstart");
          cy.get("@target").trigger("dragover").trigger("drop");

          adminPage
            .itemsArrastrables()
            .first()
            .should("not.have.text", originalText);
        });
    });
  });

  // ------------------------------------------------------------
  // Assertions: should vs expect
  // ------------------------------------------------------------
  describe("Assertions: should vs expect", () => {
    it("TC-058-Verify chained assertions on the navbar", () => {
      homePage.visit();
      navbar.nav().should("be.visible");
      navbar.nav().should("exist");
      navbar.links().should("have.length.greaterThan", 1);
    });

    it("TC-059-Verify multiple chained assertions on the email input", () => {
      loginPage.visit();
      loginPage
        .inputEmail()
        .should("exist")
        .and("be.visible")
        .and("not.be.disabled");
    });

    it("TC-060-Verify the standings table is visible and exists", () => {
      standingsPage.visit();
      standingsPage
        .tabla()
        .should("be.visible")
        .then(($table) => {
          expect($table).to.exist;
          expect($table).to.be.visible;
        });
    });

    it("TC-061-Verify the players count is within the expected range", () => {
      playersPage.visit();
      playersPage.tarjetas().then(($cards) => {
        expect($cards.length).to.be.greaterThan(0);
        expect($cards.length).to.be.lessThan(100);
      });
    });

    it("TC-062-Verify a negated assertion on the email input value", () => {
      loginPage.visit();
      loginPage.inputEmail().should("not.have.value", "something");
    });

    it("TC-063-Verify nested assertions on the first standings row", () => {
      standingsPage.visit();
      standingsPage.primeraFila().then(($row) => {
        const position = standingsPage.leerCelda($row, "position");
        expect(parseInt(position)).to.eq(1);
      });
    });
  });
});
