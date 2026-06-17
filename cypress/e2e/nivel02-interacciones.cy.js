// ============================================================
// NIVEL 2 — Interacciones y formularios
// Temas cubiertos:
//   cy.type() y sus variantes
//   cy.click() y sus variantes
//   cy.select()
//   cy.check()
//   clear()
//   cy.trigger(), sliders
//   Mouse events
//   Assertions: should vs expect
// ============================================================

describe("Nivel 2 — Interacciones y formularios", () => {
  // ------------------------------------------------------------
  // cy.type() — tipeo en inputs
  // ------------------------------------------------------------
  describe("cy.type()", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("tipea un email en el campo correspondiente", () => {
      cy.get('input[type="email"]').type("admin@futbolstats.com");
      cy.get('input[type="email"]').should(
        "have.value",
        "admin@futbolstats.com",
      );
    });

    it("tipea una contraseña en el campo password", () => {
      cy.get('input[type="password"]').type("admin1234");
      cy.get('input[type="password"]').should("have.value", "admin1234");
    });

    it("type() con {enter} envía el formulario", () => {
      cy.get('input[type="email"]').type("admin@futbolstats.com");
      cy.get('input[type="password"]').type("admin1234{enter}");
      cy.url().should("not.include", "/login");
    });

    it("type() con {selectAll} selecciona todo el texto", () => {
      cy.get('input[type="email"]').type("texto-inicial");
      cy.get('input[type="email"]').type("{selectAll}admin@futbolstats.com");
      cy.get('input[type="email"]').should(
        "have.value",
        "admin@futbolstats.com",
      );
    });

    it("type() con {backspace} borra caracteres", () => {
      cy.get('input[type="email"]').type("admin@futbolstats.co");
      cy.get('input[type="email"]').type("x{backspace}m");
      cy.get('input[type="email"]').should(
        "have.value",
        "admin@futbolstats.com",
      );
    });

    it("type() con delay simula escritura humana", () => {
      cy.get('input[type="email"]').type("admin@futbolstats.com", {
        delay: 50,
      });
      cy.get('input[type="email"]').should(
        "have.value",
        "admin@futbolstats.com",
      );
    });
  });

  // ------------------------------------------------------------
  // clear() — limpiar inputs
  // ------------------------------------------------------------
  describe("clear()", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("clear() vacía el campo email", () => {
      cy.get('input[type="email"]').type("texto-a-borrar");
      cy.get('input[type="email"]').clear();
      cy.get('input[type="email"]').should("have.value", "");
    });

    it("clear() y type() permiten reemplazar el valor de un campo", () => {
      cy.get('input[type="email"]').type("valor-incorrecto");
      cy.get('input[type="email"]').clear().type("admin@futbolstats.com");
      cy.get('input[type="email"]').should(
        "have.value",
        "admin@futbolstats.com",
      );
    });
  });

  // ------------------------------------------------------------
  // cy.click() y sus variantes
  // ------------------------------------------------------------
  describe("cy.click()", () => {
    it("click en link de la navbar navega a partidos", () => {
      cy.visit("/");
      cy.get('a[href="/fixtures"]').click();
      cy.url().should("include", "/fixtures");
    });

    it("click en link de la navbar navega a tabla", () => {
      cy.visit("/");
      cy.get('a[href="/standings"]').click();
      cy.url().should("include", "/standings");
    });

    it("click en link de jugadores navega a players", () => {
      cy.visit("/");
      cy.get('a[href="/players"]').click();
      cy.url().should("include", "/players");
    });

    it("click en botón de login envía el formulario con credenciales válidas", () => {
      cy.visit("/login");
      cy.get('input[type="email"]').type("admin@futbolstats.com");
      cy.get('input[type="password"]').type("admin1234");
      cy.get('button[type="submit"]').click();
      cy.url().should("not.include", "/login");
    });

    it("click con force:true en elemento potencialmente cubierto", () => {
      cy.visit("/login");
      cy.get('button[type="submit"]').click({ force: true });
    });

    it("click en card de partido navega al detalle", () => {
      cy.visit("/fixtures");
      cy.get('[data-testid="fixture-card"]').first().click();
      cy.url().should("match", /\/fixtures\/\d+/);
    });

    it("click en nombre de equipo navega al detalle del equipo", () => {
      cy.visit("/standings");
      cy.get('[data-testid="team-link"]').first().click();
      cy.url().should("match", /\/teams\/\d+/);
    });
  });

  // ------------------------------------------------------------
  // cy.select() — dropdown
  // ------------------------------------------------------------
  describe("cy.select()", () => {
    beforeEach(() => {
      cy.visit("/players");
    });

    it("select() filtra jugadores por posición GK", () => {
      cy.get('[data-testid="position-filter"]').select("GK");
      cy.get('[data-testid="position-filter"]').should("have.value", "GK");
    });

    it("select() filtra jugadores por posición DEF", () => {
      cy.get('[data-testid="position-filter"]').select("DEF");
      cy.get('[data-testid="position-filter"]').should("have.value", "DEF");
    });

    it("select() filtra jugadores por posición MID", () => {
      cy.get('[data-testid="position-filter"]').select("MID");
      cy.get('[data-testid="position-filter"]').should("have.value", "MID");
    });

    it("select() filtra jugadores por posición FWD", () => {
      cy.get('[data-testid="position-filter"]').select("FWD");
      cy.get('[data-testid="position-filter"]').should("have.value", "FWD");
    });

    it("select() por texto visible funciona igual que por valor", () => {
      cy.get('[data-testid="position-filter"]').select("Todos");
      cy.get('[data-testid="player-card"]').should(
        "have.length.greaterThan",
        0,
      );
    });
  });

  // ------------------------------------------------------------
  // cy.check() — checkboxes
  // Requiere feature: checkbox en admin (ej: marcar partido como destacado)
  // ------------------------------------------------------------
  describe("cy.check()", () => {
    beforeEach(() => {
      cy.visit("/login");
      cy.get('input[type="email"]').type("admin@futbolstats.com");
      cy.get('input[type="password"]').type("admin1234");
      cy.get('button[type="submit"]').click();
      cy.visit("/admin");
    });

    it.skip("check() marca un checkbox", () => {
      cy.get('[data-testid="fixture-featured-checkbox"]').first().check();
      cy.get('[data-testid="fixture-featured-checkbox"]')
        .first()
        .should("be.checked");
    });

    it.skip("uncheck() desmarca un checkbox", () => {
      cy.get('[data-testid="fixture-featured-checkbox"]').first().check();
      cy.get('[data-testid="fixture-featured-checkbox"]').first().uncheck();
      cy.get('[data-testid="fixture-featured-checkbox"]')
        .first()
        .should("not.be.checked");
    });

    it.skip("check() por valor funciona en checkbox groups", () => {
      cy.get('input[type="checkbox"][value="destacado"]').check();
      cy.get('input[type="checkbox"][value="destacado"]').should("be.checked");
    });
  });

  // ------------------------------------------------------------
  // cy.trigger() y sliders
  // Requiere feature: slider de filtro por minuto en eventos de partido
  // ------------------------------------------------------------
  describe("cy.trigger() y sliders", () => {
    beforeEach(() => {
      cy.visit("/fixtures/1");
    });

    it("trigger() dispara el evento change en un slider", () => {
      cy.get('[data-testid="minute-slider"]')
        .invoke("val", 45)
        .trigger("change");
      cy.get('[data-testid="minute-slider"]').should("have.value", "45");
    });

    it("trigger() dispara el evento input en un slider", () => {
      cy.get('[data-testid="minute-slider"]')
        .invoke("val", 90)
        .trigger("input");
      cy.get('[data-testid="minute-value"]').should("contain", "90");
    });

    it("trigger() con mouseover dispara el hover en una fixture card", () => {
      cy.visit("/fixtures");
      cy.get('[data-testid="fixture-card"]').first().trigger("mouseover");
    });
  });

  // ------------------------------------------------------------
  // Mouse events — drag & drop
  // Requiere feature: drag & drop en el admin
  // ------------------------------------------------------------
  describe("Mouse events — drag & drop", () => {
    beforeEach(() => {
      cy.visit("/login");
      cy.get('input[type="email"]').type("admin@futbolstats.com");
      cy.get('input[type="password"]').type("admin1234");
      cy.get('button[type="submit"]').click();
      cy.visit("/admin");
    });

    it.skip("drag & drop reordena elementos en el admin", () => {
      cy.get('[data-testid="draggable-item"]').first().as("origen");
      cy.get('[data-testid="draggable-item"]').last().as("destino");

      cy.get("@origen").trigger("dragstart");
      cy.get("@destino").trigger("dragover").trigger("drop");

      cy.get('[data-testid="draggable-item"]')
        .first()
        .should(
          "not.have.text",
          Cypress.$('[data-testid="draggable-item"]').first().text(),
        );
    });
  });

  // ------------------------------------------------------------
  // Assertions: should vs expect
  // ------------------------------------------------------------
  describe("Assertions: should vs expect", () => {
    it("should() — assertion encadenada sobre el DOM", () => {
      cy.visit("/");
      cy.get("nav").should("be.visible");
      cy.get("nav").should("exist");
      cy.get("nav a").should("have.length.greaterThan", 1);
    });

    it("should() con múltiples aserciones en cadena", () => {
      cy.visit("/login");
      cy.get('input[type="email"]')
        .should("exist")
        .and("be.visible")
        .and("not.be.disabled");
    });

    it("expect() — assertion BDD en bloque then()", () => {
      cy.visit("/standings");
      cy.get("table")
        .should("be.visible")
        .then(($table) => {
          expect($table).to.exist;
          expect($table).to.be.visible;
        });
    });

    it("expect() compara valores concretos", () => {
      cy.visit("/players");
      cy.get('[data-testid="player-card"]').then(($cards) => {
        expect($cards.length).to.be.greaterThan(0);
        expect($cards.length).to.be.lessThan(100);
      });
    });

    it("should() con not invierte la aserción", () => {
      cy.visit("/login");
      cy.get('input[type="email"]').should("not.have.value", "algo");
    });

    it("expect() en un then() anidado con múltiples validaciones", () => {
      cy.visit("/standings");
      cy.get('[data-testid="standings-row"]')
        .first()
        .then(($row) => {
          const posicion = $row.find('[data-testid="position"]').text();
          expect(parseInt(posicion)).to.eq(1);
        });
    });
  });
});
