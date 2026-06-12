// ============================================================
// NIVEL 1 — Fundamentos de navegación y DOM
// Temas cubiertos:
//   cy.visit(), cy.title(), cy.log(), cy.get(), cy.contains()
//   cy.document(), charset, url
//   Referencias de windows
//   Modos de navegación: go back / forward / reload
//   Script básico de pruebas
//   Estructura: describe / it / it.only
//   Hooks: before / beforeEach / after / afterEach
//   Selectores CSS: ID, class, attribute, tag
// ============================================================

describe("Nivel 1 — Fundamentos de navegación y DOM", () => {
  // ------------------------------------------------------------
  // HOOKS
  // before  → corre UNA vez antes de todos los tests del describe
  // after   → corre UNA vez después de todos los tests del describe
  // beforeEach → corre antes de CADA it
  // afterEach  → corre después de CADA it
  // ------------------------------------------------------------
  before(() => {
    cy.log("Iniciando suite: Nivel 1 — Fundamentos");
  });

  after(() => {
    cy.log("Suite finalizada: Nivel 1 — Fundamentos");
  });

  beforeEach(() => {
    cy.visit("/");
  });

  // ------------------------------------------------------------
  // cy.visit() — navegación básica
  // ------------------------------------------------------------
  describe("cy.visit()", () => {
    it("visita la página de inicio", () => {
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
    });

    it("visita la página de partidos", () => {
      cy.visit("/fixtures");
      cy.url().should("include", "/fixtures");
    });

    it("visita la página de tabla de posiciones", () => {
      cy.visit("/standings");
      cy.url().should("include", "/standings");
    });

    it("visita la página de jugadores", () => {
      cy.visit("/players");
      cy.url().should("include", "/players");
    });

    it("visita login", () => {
      cy.visit("/login");
      cy.url().should("include", "/login");
    });
  });

  // ------------------------------------------------------------
  // cy.title() — validar el <title> de cada página
  // Requiere que la app tenga titles dinámicos por ruta
  // ------------------------------------------------------------
  describe("cy.title()", () => {
    it("la página de inicio tiene el title correcto", () => {
      cy.title().should("include", "FutbolStats");
    });

    it("la página de partidos tiene el title correcto", () => {
      cy.visit("/fixtures");
      cy.title().should("include", "Partidos");
    });

    it("la página de tabla tiene el title correcto", () => {
      cy.visit("/standings");
      cy.title().should("include", "Tabla");
    });

    it("la página de jugadores tiene el title correcto", () => {
      cy.visit("/players");
      cy.title().should("include", "Jugadores");
    });

    it("la página de login tiene el title correcto", () => {
      cy.visit("/login");
      cy.title().should("include", "Login");
    });
  });

  // ------------------------------------------------------------
  // cy.log() — agregar mensajes en el runner de Cypress
  // ------------------------------------------------------------
  describe("cy.log()", () => {
    it("usa cy.log() para documentar pasos del test", () => {
      cy.log("Verificando que la página de inicio carga correctamente");
      cy.get("nav").should("be.visible");
      cy.log("Navbar visible — OK");
      cy.get("main").should("exist");
      cy.log("Contenido principal presente — OK");
    });
  });

  // ------------------------------------------------------------
  // cy.get() y cy.contains() — selectores CSS: tag, class, id, attribute
  // ------------------------------------------------------------
  describe("cy.get() y cy.contains() — selectores", () => {
    it("selecciona por tag — encuentra el nav", () => {
      cy.get("nav").should("exist");
    });

    it("selecciona por clase — encuentra links de la navbar", () => {
      cy.get("nav a").should("have.length.greaterThan", 0);
    });

    it("selecciona por atributo — encuentra links con href", () => {
      cy.get('a[href="/fixtures"]').should("exist");
    });

    it("selecciona por atributo — encuentra inputs de tipo email en login", () => {
      cy.visit("/login");
      cy.get('input[type="email"]').should("exist");
      cy.get('input[type="password"]').should("exist");
    });

    it("cy.contains() encuentra texto visible en la navbar", () => {
      cy.contains("Partidos").should("be.visible");
      cy.contains("Tabla").should("be.visible");
      cy.contains("Jugadores").should("be.visible");
    });

    it("cy.contains() encuentra el título de la app", () => {
      cy.contains("FUTBOL").should("exist");
    });

    it("selecciona por data-testid (buena práctica)", () => {
      cy.get('[data-testid="navbar"]').should("exist");
    });
  });

  // ------------------------------------------------------------
  // cy.document() — acceso al documento y charset
  // ------------------------------------------------------------
  describe("cy.document()", () => {
    it("el documento existe y es accesible", () => {
      cy.document().should("exist");
    });

    it("el charset del documento es UTF-8", () => {
      cy.document().its("characterSet").should("eq", "UTF-8");
    });

    it("el contentType es text/html", () => {
      cy.document().its("contentType").should("eq", "text/html");
    });
  });

  // ------------------------------------------------------------
  // cy.url() — referencias de la URL actual
  // ------------------------------------------------------------
  describe("Referencias de windows — url", () => {
    it("la URL de inicio no contiene rutas adicionales", () => {
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
    });

    it("la URL cambia al navegar a /fixtures", () => {
      cy.visit("/fixtures");
      cy.url().should("include", "/fixtures");
    });

    it("cy.window() devuelve el objeto window", () => {
      cy.window().should("exist");
    });

    it("cy.window() tiene la propiedad location con la URL correcta", () => {
      cy.window().its("location.pathname").should("eq", "/");
    });

    it("cy.window() tiene la propiedad document", () => {
      cy.window().its("document").should("exist");
    });
  });

  // ------------------------------------------------------------
  // Modos de navegación: go back / forward / reload
  // ------------------------------------------------------------
  describe("Modos de navegación", () => {
    it('go("back") vuelve a la página anterior', () => {
      cy.visit("/fixtures");
      cy.visit("/standings");
      cy.go("back");
      cy.url().should("include", "/fixtures");
    });

    it('go("forward") avanza a la página siguiente', () => {
      cy.visit("/fixtures");
      cy.visit("/standings");
      cy.go("back");
      cy.go("forward");
      cy.url().should("include", "/standings");
    });

    it("reload() recarga la página sin perder la ruta", () => {
      cy.visit("/fixtures");
      cy.reload();
      cy.url().should("include", "/fixtures");
    });

    it("reload() mantiene el contenido de la página", () => {
      cy.visit("/standings");
      cy.reload();
      cy.get("table").should("exist");
    });
  });
});
