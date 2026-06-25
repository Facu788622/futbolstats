// ============================================================
// NIVEL 4 — Diseño avanzado de pruebas
// Temas cubiertos:
//   cy.session()
//   cy.request()
//   cy.intercept()
//   Fixtures de pruebas
//   Custom commands (referenciados — se definen en commands.js)
//   Page Object Model (referenciado — se definen en support/pages/)
//   Upload files
//   Uso de Faker
// ============================================================

// ------------------------------------------------------------
// Faker — generación de datos dinámicos
// npm install @faker-js/faker --save-dev
// ------------------------------------------------------------
import { faker } from "@faker-js/faker";

// ------------------------------------------------------------
// Page Objects (importados desde support/pages/)
// Ejemplo de uso — los archivos se crearían en:
//   cypress/support/pages/LoginPage.js
//   cypress/support/pages/AdminPage.js
// ------------------------------------------------------------
// import LoginPage from '../support/pages/LoginPage'
// import AdminPage from '../support/pages/AdminPage'

describe("Nivel 4 — Diseño avanzado de pruebas", () => {
  // ------------------------------------------------------------
  // cy.session() — persistir sesión entre tests
  // Evita hacer login antes de cada test que lo requiera
  // ------------------------------------------------------------
  describe("cy.session()", () => {
    // Función helper reutilizable para crear la sesión de admin
    const loginComoAdmin = () => {
      cy.session("admin", () => {
        cy.visit("/login");
        cy.get('input[type="email"]').type("admin@futbolstats.com");
        cy.get('input[type="password"]').type("admin1234");
        cy.get('button[type="submit"]').click();
        cy.url().should("not.include", "/login");
      });
    };

    it("session() crea y persiste la sesión de admin", () => {
      loginComoAdmin();
      cy.visit("/admin");
      cy.url().should("include", "/admin");
    });

    it("session() reutiliza la sesión sin volver a hacer login", () => {
      loginComoAdmin();
      cy.visit("/admin");
      cy.get('[data-testid="admin-panel"]').should("be.visible");
    });

    it("una sesión de usuario regular no accede al admin", () => {
      cy.session("usuario-regular", () => {
        cy.visit("/login");
        cy.get('input[type="email"]').type("user@futbolstats.com");
        cy.get('input[type="password"]').type("user1234");
        cy.get('button[type="submit"]').click();
      });
      cy.visit("/admin");
      cy.url().should("not.include", "/admin");
    });
  });

  // ------------------------------------------------------------
  // cy.request() — llamadas HTTP directas
  // ------------------------------------------------------------
  describe("cy.request()", () => {
    it("GET /api/standings/1 devuelve 200", () => {
      cy.request("GET", "/api/standings/1").its("status").should("eq", 200);
    });

    it("GET /api/fixtures devuelve un array de partidos", () => {
      cy.request("GET", "/api/fixtures").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.be.an("array");
        expect(response.body.data.length).to.be.greaterThan(0);
      });
    });

    it("GET /api/players devuelve jugadores con propiedades esperadas", () => {
      cy.request("GET", "/api/players").then((response) => {
        const primerJugador = response.body.data[0];
        expect(primerJugador).to.have.property("name");
        expect(primerJugador).to.have.property("position");
        expect(primerJugador).to.have.property("team_id");
      });
    });

    it("POST /api/auth/login con credenciales válidas devuelve token", () => {
      cy.request("POST", "/api/auth/login", {
        email: "admin@futbolstats.com",
        password: "admin1234",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.property("token");
      });
    });

    it("POST /api/auth/login con credenciales inválidas devuelve 401", () => {
      cy.request({
        method: "POST",
        url: "/api/auth/login",
        body: { email: "noexiste@test.com", password: "wrongpass" },
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 401);
    });

    it("GET endpoint protegido sin token devuelve 401", () => {
      cy.request({
        method: "POST",
        url: "/api/fixtures",
        body: {},
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 401);
    });

    it("request() con alias y then() valida la estructura completa", () => {
      cy.request("GET", "/api/fixtures/1").as("fixtureUno");
      cy.get("@fixtureUno").then((response) => {
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
  // cy.intercept() — interceptar y controlar llamadas a la API
  // ------------------------------------------------------------
  describe("cy.intercept()", () => {
    it("intercept() espera una llamada a la API antes de interactuar", () => {
      cy.intercept("GET", "/api/fixtures*").as("getFixtures");
      cy.visit("/fixtures");
      cy.wait("@getFixtures")
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);
    });
    it("intercept() verifica que standings llama al endpoint correcto", () => {
      cy.intercept("GET", "/api/standings/*").as("getStandings");
      cy.visit("/standings");
      cy.wait("@getStandings")
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);
    });

    it("intercept() espía la llamada a players al filtrar por posición", () => {
      cy.intercept("GET", "/api/players*").as("getPlayers");
      cy.visit("/players");
      cy.wait("@getPlayers");
      cy.intercept("GET", "/api/players*position=FWD*").as("getPlayersFWD");
      cy.get('[data-testid="position-filter"]').select("FWD");
      cy.wait("@getPlayersFWD")
        .its("request.url")
        .should("include", "position=FWD");
    });

    it("intercept() stub — reemplaza la respuesta con un fixture local", () => {
      cy.intercept("GET", "/api/standings/1", { fixture: "standings.json" }).as(
        "standingsStub",
      );
      cy.visit("/standings");
      cy.wait("@standingsStub");
      cy.get('[data-testid="standings-row"]').should(
        "have.length.greaterThan",
        0,
      );
    });

    it("intercept() simula error de red en fixtures", () => {
      cy.intercept("GET", "/api/fixtures*", { forceNetworkError: true }).as(
        "errorFixtures",
      );
      cy.visit("/fixtures");
      cy.wait("@errorFixtures");
      cy.get('[data-testid="error-message"]').should("be.visible");
    });

    it("intercept() modifica la respuesta de la API en tiempo real", () => {
      cy.fixture("standings").then((standings) => {
        standings.data[0].points = 999;
        cy.intercept("GET", "/api/standings/1", standings).as(
          "standingsModificado",
        );
        cy.visit("/standings");
        cy.wait("@standingsModificado");
        cy.get('[data-testid="standings-row"]')
          .first()
          .find('[data-testid="points"]')
          .should("have.text", "999");
      });
    });
  });

  // ------------------------------------------------------------
  // Fixtures de pruebas — archivos en cypress/fixtures/
  // Los archivos JSON van en:
  //   cypress/fixtures/usuario-admin.json
  //   cypress/fixtures/usuario-regular.json
  //   cypress/fixtures/standings.json
  // ------------------------------------------------------------
  describe("Fixtures de pruebas", () => {
    it("carga datos de login desde un fixture JSON", () => {
      cy.fixture("usuario-admin").then((usuario) => {
        cy.visit("/login");
        cy.get('input[type="email"]').type(usuario.email);
        cy.get('input[type="password"]').type(usuario.password);
        cy.get('button[type="submit"]').click();
        cy.url().should("not.include", "/login");
      });
    });

    it("usa fixture para stub de la API de standings", () => {
      cy.fixture("standings").then((data) => {
        cy.intercept("GET", "/api/standings/1", data).as("standingsFixture");
        cy.visit("/standings");
        cy.wait("@standingsFixture");
      });
    });

    it("fixture de usuario regular no tiene acceso al admin", () => {
      cy.fixture("usuario-regular").then((usuario) => {
        cy.visit("/login");
        cy.get('input[type="email"]').type(usuario.email);
        cy.get('input[type="password"]').type(usuario.password);
        cy.get('button[type="submit"]').click();
        cy.visit("/admin");
        cy.url().should("not.include", "/admin");
      });
    });
  });

  // ------------------------------------------------------------
  // Custom Commands — referenciados
  // Los comandos se definen en cypress/support/commands.js
  // Ejemplos:
  //   cy.login(email, password)
  //   cy.loginComoAdmin()
  //   cy.cerrarSesion()
  // ------------------------------------------------------------
  describe("Custom Commands", () => {
    it.skip("cy.loginComoAdmin() — comando personalizado de login", () => {
      cy.loginComoAdmin();
      cy.visit("/admin");
      cy.get('[data-testid="admin-panel"]').should("be.visible");
    });

    it.skip("cy.cerrarSesion() — comando personalizado de logout", () => {
      cy.loginComoAdmin();
      cy.cerrarSesion();
      cy.url().should("include", "/login");
    });

    it("cy.login() con parámetros dinámicos", () => {
      cy.fixture("usuario-admin").then((usuario) => {
        cy.login(usuario.email, usuario.password);
        cy.url().should("not.include", "/login");
      });
    });
  });

  // ------------------------------------------------------------
  // Page Object Model — referenciado
  // Los POM se definen en cypress/support/pages/
  // ------------------------------------------------------------
  describe("Page Object Model", () => {
    it("LoginPage.completarFormulario() encapsula la interacción con el form", () => {
      // Con POM el test queda limpio y legible:
      // const login = new LoginPage()
      // login.visit()
      // login.completarFormulario('admin@futbolstats.com', 'admin1234')
      // login.submit()
      // cy.url().should('not.include', '/login')

      // Sin POM (equivalente directo):
      cy.visit("/login");
      cy.get('input[type="email"]').type("admin@futbolstats.com");
      cy.get('input[type="password"]').type("admin1234");
      cy.get('button[type="submit"]').click();
      cy.url().should("not.include", "/login");
    });

    it("StandingsPage.obtenerPrimerEquipo() encapsula la lectura de la tabla", () => {
      // const standings = new StandingsPage()
      // standings.visit()
      // standings.obtenerPrimerEquipo().should('exist')

      cy.visit("/standings");
      cy.get('[data-testid="standings-row"]')
        .first()
        .find('[data-testid="team-name"]')
        .should("exist");
    });
  });

  // ------------------------------------------------------------
  // Upload files — subir imagen desde admin
  // Requiere feature: input file en admin al editar jugador/equipo
  // ------------------------------------------------------------
  describe("Upload files", () => {
    beforeEach(() => {
      cy.loginComoAdmin();
      cy.visit("/admin");
    });
    it("input de tipo file existe en el formulario de edición", () => {
      cy.get('[data-testid="edit-player-btn"]').last().click();
      cy.get('input[type="file"]').should("exist");
    });

    it.skip("selectFile() sube una imagen al editar un jugador", () => {
      cy.get('[data-testid="edit-player-btn"]').last().click();
      cy.get('input[type="file"]').selectFile(
        "cypress/fixtures/imagen-jugador.jpg",
      );
      cy.get('[data-testid="file-preview"]').should("be.visible");
    });

    it("selectFile() acepta solo imágenes (tipo MIME correcto)", () => {
      cy.get('[data-testid="edit-player-btn"]').last().click();
      cy.get('input[type="file"]')
        .invoke("attr", "accept")
        .should("include", "image/");
    });
  });

  // ------------------------------------------------------------
  // Uso de Faker — datos dinámicos en tests
  // ------------------------------------------------------------
  describe("Uso de Faker", () => {
    it.skip("faker genera un email único para registro", () => {
      const email = faker.internet.email();
      const password = faker.internet.password({ length: 8 });

      cy.visit("/register");
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should("not.include", "/register");
    });

    it("faker evita conflictos de email en múltiples ejecuciones", () => {
      const email = faker.internet.email();
      cy.request({
        method: "POST",
        url: "/api/auth/register",
        body: { email, password: "Test1234!" },
      })
        .its("status")
        .should("eq", 201);
    });

    it("registrar dos usuarios con faker no genera conflicto de emails", () => {
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
