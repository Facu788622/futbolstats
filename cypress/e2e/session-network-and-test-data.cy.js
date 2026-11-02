// ============================================================
// FEATURE: Session, Network and Test Data
// Test cases: TC-100 to TC-129
// Playwright equivalent: playwright/tests/session-network-and-test-data.spec.ts
//
// Covers:
//   cy.session()
//   cy.request()
//   cy.intercept()
//   Test fixtures
//   Custom commands (defined in support/commands.js)
//   Page Object Model (defined in support/pages/)
//   File upload
//   Faker data generation
//
// Responsibilities:
//   fixtures/         -> test data, stubs and selectors.json
//   support/commands  -> transversal actions (login, logout, token)
//   support/pages     -> navigation, actions and queries per page
//   tests             -> intent and assertions
// ============================================================

// ------------------------------------------------------------
// Faker - dynamic data generation
// npm install @faker-js/faker --save-dev
// ------------------------------------------------------------
import { faker } from "@faker-js/faker";

// ------------------------------------------------------------
// Page objects (cypress/support/pages/)
// ------------------------------------------------------------
import LoginPage from "../support/pages/LoginPage";
import AdminPage from "../support/pages/AdminPage";
import StandingsPage from "../support/pages/StandingsPage";
import PlayersPage from "../support/pages/PlayersPage";
import FixturesPage from "../support/pages/FixturesPage";

describe("Session, Network and Test Data", () => {
  // ------------------------------------------------------------
  // cy.session() - persist the session between tests
  // Avoids logging in before every test that needs it
  // ------------------------------------------------------------
  describe("Sessions", () => {
    // Reusable helper to create the admin session
    const loginAsAdmin = () => {
      cy.session("admin", () => {
        LoginPage.login("admin@futbolstats.com", "admin1234");
        cy.url().should("not.include", "/login");
      });
    };

    it("TC-100-Verify an admin session can access the admin page", () => {
      loginAsAdmin();
      AdminPage.visit();
      cy.url().should("include", "/admin");
    });

    it("TC-101-Verify an admin session displays the admin panel", () => {
      loginAsAdmin();
      AdminPage.visit();
      AdminPage.panel().should("be.visible");
    });

    it("TC-102-Verify a regular user session cannot access the admin page", () => {
      cy.session("regular-user", () => {
        LoginPage.login("viewer@futbolstats.com", "viewer1234");
      });
      AdminPage.visit();
      cy.url().should("not.include", "/admin");
    });
  });

  // ------------------------------------------------------------
  // cy.request() - direct HTTP calls
  // (does not interact with the UI, does not use page objects)
  // ------------------------------------------------------------
  describe("Direct HTTP requests", () => {
    it("TC-103-Verify GET /api/standings/1 returns 200", () => {
      cy.request("GET", "/api/standings/1").its("status").should("eq", 200);
    });

    it("TC-104-Verify GET /api/fixtures returns an array of fixtures", () => {
      cy.request("GET", "/api/fixtures").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.be.an("array");
        expect(response.body.data.length).to.be.greaterThan(0);
      });
    });

    it("TC-105-Verify GET /api/players returns players with the expected properties", () => {
      cy.request("GET", "/api/players").then((response) => {
        const firstPlayer = response.body.data[0];
        expect(firstPlayer).to.have.property("name");
        expect(firstPlayer).to.have.property("position");
        expect(firstPlayer).to.have.property("team_id");
      });
    });

    it("TC-106-Verify POST /api/auth/login with valid credentials returns a token", () => {
      cy.request("POST", "/api/auth/login", {
        email: "admin@futbolstats.com",
        password: "admin1234",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.property("token");
      });
    });

    it("TC-107-Verify POST /api/auth/login with invalid credentials returns 401", () => {
      cy.request({
        method: "POST",
        url: "/api/auth/login",
        body: { email: "noexiste@test.com", password: "wrongpass" },
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 401);
    });

    it("TC-108-Verify POST to a protected endpoint without a token returns 401", () => {
      cy.request({
        method: "POST",
        url: "/api/fixtures",
        body: {},
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 401);
    });

    it("TC-109-Verify the full structure of the fixture detail response", () => {
      cy.request("GET", "/api/fixtures/1").as("fixtureOne");
      cy.get("@fixtureOne").then((response) => {
        expect(response.body.data).to.have.property("id", 1);
        expect(response.body.data).to.have.property("home_team_id");
        expect(response.body.data).to.have.property("away_team_id");
        expect(response.body.data.home_team_id).to.not.eq(
          response.body.data.away_team_id,
        );
      });
    });
  });

  // ------------------------------------------------------------
  // cy.intercept() - intercept and control API calls
  // ------------------------------------------------------------
  describe("Network interception", () => {
    it("TC-110-Verify the fixtures API call completes before interacting", () => {
      cy.intercept("GET", "/api/fixtures*").as("getFixtures");
      FixturesPage.visit();
      cy.wait("@getFixtures")
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);
    });

    it("TC-111-Verify the standings page calls the correct endpoint", () => {
      cy.intercept("GET", "/api/standings/*").as("getStandings");
      StandingsPage.visit();
      cy.wait("@getStandings")
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);
    });

    it("TC-112-Verify filtering players by position calls the API with that position", () => {
      cy.intercept("GET", "/api/players*").as("getPlayers");
      PlayersPage.visit();
      cy.wait("@getPlayers");
      cy.intercept("GET", "/api/players*position=FWD*").as("getPlayersFWD");
      PlayersPage.filtrarPorPosicion("FWD");
      cy.wait("@getPlayersFWD")
        .its("request.url")
        .should("include", "position=FWD");
    });

    it("TC-113-Verify stubbing the standings response with a local fixture", () => {
      cy.intercept("GET", "/api/standings/1", { fixture: "standings.json" }).as(
        "standingsStub",
      );
      StandingsPage.visit();
      cy.wait("@standingsStub");
      StandingsPage.filas().should("have.length.greaterThan", 0);
    });

    it("TC-114-Verify the fixtures page shows an error on a network failure", () => {
      cy.intercept("GET", "/api/fixtures*", { forceNetworkError: true }).as(
        "errorFixtures",
      );
      FixturesPage.visit();
      cy.wait("@errorFixtures");
      FixturesPage.mensajeError().should("be.visible");
    });

    it("TC-115-Verify a modified standings response is reflected in the UI", () => {
      cy.fixture("standings").then((standings) => {
        standings.data[0].points = 999;
        cy.intercept("GET", "/api/standings/1", standings).as(
          "standingsModified",
        );
        StandingsPage.visit();
        cy.wait("@standingsModified");
        StandingsPage.celda(0, "points").should("have.text", "999");
      });
    });
  });

  // ------------------------------------------------------------
  // Test data - files in cypress/fixtures/
  //   cypress/fixtures/usuario-admin.json
  //   cypress/fixtures/usuario-regular.json
  //   cypress/fixtures/standings.json
  //   cypress/fixtures/selectors.json   (selectors, used by the page objects)
  // ------------------------------------------------------------
  describe("Test data", () => {
    it("TC-116-Verify login with credentials loaded from a JSON fixture", () => {
      cy.fixture("usuario-admin").then((user) => {
        LoginPage.login(user.email, user.password);
        cy.url().should("not.include", "/login");
      });
    });

    it("TC-117-Verify stubbing the standings API with a JSON fixture", () => {
      cy.fixture("standings").then((data) => {
        cy.intercept("GET", "/api/standings/1", data).as("standingsFixture");
        StandingsPage.visit();
        cy.wait("@standingsFixture");
      });
    });

    it("TC-118-Verify a regular user fixture cannot access the admin page", () => {
      cy.fixture("usuario-regular").then((user) => {
        LoginPage.login(user.email, user.password);
        AdminPage.visit();
        cy.url().should("not.include", "/admin");
      });
    });
  });

  // ------------------------------------------------------------
  // Custom commands - transversal actions
  // Defined in cypress/support/commands.js
  //   cy.login(email, password)
  //   cy.loginComoAdmin()
  //   cy.cerrarSesion()
  // ------------------------------------------------------------
  describe("Custom commands", () => {
    it.skip("TC-119-Verify the admin login command opens the admin panel", () => {
      cy.loginComoAdmin();
      AdminPage.visit();
      AdminPage.panel().should("be.visible");
    });

    it.skip("TC-120-Verify the logout command returns to the login page", () => {
      cy.loginComoAdmin();
      cy.cerrarSesion();
      cy.url().should("include", "/login");
    });

    it("TC-121-Verify login with dynamic credentials", () => {
      cy.fixture("usuario-admin").then((user) => {
        cy.login(user.email, user.password);
        cy.url().should("not.include", "/login");
      });
    });
  });

  // ------------------------------------------------------------
  // Page Object Model
  // The page objects live in cypress/support/pages/ and use the
  // selectors from cypress/fixtures/selectors.json
  // ------------------------------------------------------------
  describe("Page Object Model", () => {
    it("TC-122-Verify the login page object encapsulates the login form interaction", () => {
      LoginPage.visit();
      LoginPage.completarFormulario("admin@futbolstats.com", "admin1234");
      LoginPage.submit();
      cy.url().should("not.include", "/login");
    });

    it("TC-123-Verify the standings page object encapsulates reading the table", () => {
      StandingsPage.visit();
      StandingsPage.obtenerPrimerEquipo().should("exist");
    });
  });

  // ------------------------------------------------------------
  // File upload - upload an image from the admin panel
  // Requires feature: file input in the admin player/team edit form
  // ------------------------------------------------------------
  describe("File upload", () => {
    beforeEach(() => {
      cy.loginComoAdmin();
      AdminPage.visit();
    });

    it("TC-124-Verify the file input exists in the player edit form", () => {
      AdminPage.editarUltimoJugador();
      AdminPage.inputArchivo().should("exist");
    });

    it.skip("TC-125-Verify uploading an image in the player edit form shows a preview", () => {
      AdminPage.editarUltimoJugador();
      AdminPage.inputArchivo().selectFile("cypress/fixtures/imagen-jugador.jpg");
      cy.get('[data-testid="file-preview"]').should("be.visible");
    });

    it("TC-126-Verify the file input accepts only images", () => {
      AdminPage.editarUltimoJugador();
      AdminPage.inputArchivo().invoke("attr", "accept").should("include", "image/");
    });
  });

  // ------------------------------------------------------------
  // Faker - dynamic data in tests
  // ------------------------------------------------------------
  describe("Faker data generation", () => {
    it.skip("TC-127-Verify registering with a generated email through the UI", () => {
      const email = faker.internet.email();
      const password = faker.internet.password({ length: 8 });

      cy.visit("/register");
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should("not.include", "/register");
    });

    it("TC-128-Verify a generated email avoids conflicts across executions", () => {
      const email = faker.internet.email();
      cy.request({
        method: "POST",
        url: "/api/auth/register",
        body: { email, password: "Test1234!" },
      })
        .its("status")
        .should("eq", 201);
    });

    it("TC-129-Verify registering two users with generated emails does not conflict", () => {
      const email1 = faker.internet.email();
      const email2 = faker.internet.email();
      expect(email1).to.not.eq(email2);

      cy.request({
        method: "POST",
        url: "/api/auth/register",
        body: { email: email1, password: "Pass1234!" },
      })
        .its("status")
        .should("eq", 201);

      cy.request({
        method: "POST",
        url: "/api/auth/register",
        body: { email: email2, password: "Pass1234!" },
      })
        .its("status")
        .should("eq", 201);
    });
  });
});
