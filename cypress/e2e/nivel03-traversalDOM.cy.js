// ============================================================
// NIVEL 3 — Traversal del DOM y manejo de colecciones
// Temas cubiertos:
//   cy.each() / forEach
//   cy.wrap()
//   cy.invoke() y invoke + then()
//   Manejo de tablas: children / eq / filter / find / first / last / nextAll / parent
//   Manejo de fechas (date picker)
//   Alias
//   Análisis de DOM con JSON
// ============================================================

describe("Nivel 3 — Traversal del DOM y colecciones", () => {
  // ------------------------------------------------------------
  // Alias — cy.as()
  // ------------------------------------------------------------
  describe("Alias", () => {
    beforeEach(() => {
      cy.visit("/standings");
    });

    it("alias sobre un elemento DOM", () => {
      cy.get("table").as("tablaStandings");
      cy.get("@tablaStandings").should("be.visible");
    });

    it("alias sobre una colección de filas", () => {
      cy.get('[data-testid="standings-row"]').as("filas");
      cy.get("@filas").should("have.length.greaterThan", 0);
    });

    it("alias sobre un resultado de cy.request()", () => {
      cy.request("GET", "/api/standings/1").as("standings");
      cy.get("@standings").its("status").should("eq", 200);
    });

    it("alias reutilizable en múltiples assertions", () => {
      cy.get('[data-testid="standings-row"]').as("filas");
      cy.get("@filas").first().should("contain", "1");
      cy.get("@filas").last().should("exist");
    });
  });

  // ------------------------------------------------------------
  // cy.each() — iterar sobre colecciones del DOM
  // ------------------------------------------------------------
  describe("cy.each()", () => {
    it("each() itera sobre todas las filas de standings y valida que no estén vacías", () => {
      cy.visit("/standings");
      cy.get('[data-testid="standings-row"]').each(($fila) => {
        expect($fila.text().trim()).to.not.be.empty;
      });
    });

    it("each() itera sobre player cards y verifica que tienen nombre", () => {
      cy.visit("/players");
      cy.get('[data-testid="player-card"]').each(($card) => {
        const nombre = $card.find('[data-testid="player-name"]').text();
        expect(nombre.trim()).to.not.be.empty;
      });
    });

    it("each() itera sobre links de la navbar y verifica sus hrefs", () => {
      cy.visit("/");
      const rutasEsperadas = ["/", "/fixtures", "/standings", "/players"];
      cy.get("nav a").each(($link, index) => {
        expect($link.attr("href")).to.eq(rutasEsperadas[index]);
      });
    });

    it("each() con forEach nativo dentro del bloque then()", () => {
      cy.visit("/standings");
      cy.get('[data-testid="standings-row"]').then(($filas) => {
        const textos = [];
        $filas.each((i, el) => {
          textos.push(Cypress.$(el).text());
        });
        expect(textos.length).to.be.greaterThan(0);
      });
    });
  });

  // ------------------------------------------------------------
  // cy.wrap()
  // ------------------------------------------------------------
  describe("cy.wrap()", () => {
    it("wrap() convierte un valor JS en sujeto Cypress", () => {
      cy.visit("/standings");
      cy.get('[data-testid="standings-row"]')
        .first()
        .then(($fila) => {
          cy.wrap($fila).should("be.visible");
        });
    });

    it("wrap() sobre un objeto para encadenar assertions", () => {
      const datos = { equipo: "River", puntos: 45 };
      cy.wrap(datos).its("equipo").should("eq", "River");
      cy.wrap(datos).its("puntos").should("be.greaterThan", 0);
    });

    it("wrap() con una promesa JS", () => {
      const promesa = new Promise((resolve) => resolve("ok"));
      cy.wrap(promesa).should("eq", "ok");
    });

    it("wrap() sobre elemento encontrado con each()", () => {
      cy.visit("/players");
      cy.get('[data-testid="player-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="player-name"]').should("exist");
      });
    });
  });

  // ------------------------------------------------------------
  // cy.invoke()
  // ------------------------------------------------------------
  describe("cy.invoke()", () => {
    it('invoke("text") obtiene el texto de un elemento', () => {
      cy.visit("/standings");
      cy.get('[data-testid="standings-row"]')
        .first()
        .invoke("text")
        .should("not.be.empty");
    });

    it('invoke("attr", "href") obtiene el href de un link', () => {
      cy.visit("/");
      cy.get('a[href="/fixtures"]')
        .invoke("attr", "href")
        .should("eq", "/fixtures");
    });

    it('invoke("val") obtiene el valor de un input', () => {
      cy.visit("/login");
      cy.get('input[type="email"]').type("test@test.com");
      cy.get('input[type="email"]').invoke("val").should("eq", "test@test.com");
    });

    it('invoke("removeAttr") + then() manipula el DOM', () => {
      cy.visit("/login");
      cy.get('input[type="email"]')
        .invoke("removeAttr", "type")
        .then(($input) => {
          expect($input.attr("type")).to.be.undefined;
        });
    });

    it('invoke("addClass") agrega una clase CSS', () => {
      cy.visit("/");
      cy.get("nav")
        .invoke("addClass", "test-class")
        .should("have.class", "test-class");
    });
  });

  // ------------------------------------------------------------
  // Manejo de tablas — Tabla de Posiciones
  // children / eq / filter / find / first / last / nextAll / parent
  // ------------------------------------------------------------
  describe("Manejo de tablas — Standings", () => {
    beforeEach(() => {
      cy.visit("/standings");
      cy.get("table").as("tabla");
    });

    it("children() obtiene las filas del tbody", () => {
      cy.get("table tbody").children().should("have.length.greaterThan", 0);
    });

    it("first() obtiene el primer equipo (posición 1)", () => {
      cy.get('[data-testid="standings-row"]')
        .first()
        .find('[data-testid="position"]')
        .should("have.text", "1");
    });

    it("last() obtiene el último equipo de la tabla", () => {
      cy.get('[data-testid="standings-row"]').last().should("exist");
    });

    it("eq(0) equivale a first()", () => {
      cy.get('[data-testid="standings-row"]')
        .eq(0)
        .find('[data-testid="position"]')
        .should("have.text", "1");
    });

    it("eq(2) obtiene el tercer equipo", () => {
      cy.get('[data-testid="standings-row"]')
        .eq(2)
        .find('[data-testid="position"]')
        .should("have.text", "3");
    });

    it("find() busca un elemento dentro de otro", () => {
      cy.get('[data-testid="standings-row"]')
        .first()
        .find('[data-testid="team-name"]')
        .should("exist")
        .and("not.be.empty");
    });

    it("filter() selecciona filas que contienen cierto equipo", () => {
      cy.get('[data-testid="standings-row"]')
        .filter(':contains("River")')
        .should("have.length", 1);
    });

    it("parent() sube al contenedor padre de una celda", () => {
      cy.get('[data-testid="standings-row"]')
        .first()
        .find('[data-testid="points"]')
        .parent()
        .should("have.attr", "data-testid", "standings-row");
    });

    it("nextAll() obtiene todas las filas siguientes a la primera", () => {
      cy.get('[data-testid="standings-row"]')
        .first()
        .nextAll()
        .should("have.length.greaterThan", 0);
    });

    it("verifica que los puntos son números válidos", () => {
      cy.get('[data-testid="standings-row"]').each(($fila) => {
        const puntos = parseInt($fila.find('[data-testid="points"]').text());
        expect(puntos).to.be.a("number");
        expect(puntos).to.be.gte(0);
      });
    });

    it("verifica coherencia matemática: wins*3 + draws = points", () => {
      cy.get('[data-testid="standings-row"]')
        .first()
        .then(($fila) => {
          const wins = parseInt($fila.find('[data-testid="wins"]').text());
          const draws = parseInt($fila.find('[data-testid="draws"]').text());
          const points = parseInt($fila.find('[data-testid="points"]').text());
          expect(wins * 3 + draws).to.eq(points);
        });
    });
  });

  // ------------------------------------------------------------
  // Manejo de fechas — date picker en filtro de partidos
  // Requiere feature: filtro por rango de fechas en /fixtures
  // ------------------------------------------------------------
  describe("Manejo de fechas", () => {
    beforeEach(() => {
      cy.visit("/fixtures");
    });

    it("el date picker existe en la página de partidos", () => {
      cy.get('[data-testid="date-from"]').should("exist");
      cy.get('[data-testid="date-to"]').should("exist");
    });

    it("type() ingresa una fecha en el input de fecha desde", () => {
      cy.get('[data-testid="date-from"]').type("2025-01-01");
      cy.get('[data-testid="date-from"]').should("have.value", "2025-01-01");
    });

    it("ingresa un rango de fechas y filtra partidos", () => {
      cy.get('[data-testid="date-from"]').type("2025-01-01");
      cy.get('[data-testid="date-to"]').type("2025-06-30");
      cy.get('[data-testid="apply-date-filter"]').click();
      cy.get('[data-testid="fixture-card"]').should(
        "have.length.greaterThan",
        0,
      );
    });

    it("invoke() obtiene el valor de un input de tipo date", () => {
      cy.get('[data-testid="date-from"]').type("2025-03-15");
      cy.get('[data-testid="date-from"]')
        .invoke("val")
        .should("eq", "2025-03-15");
    });

    it("clear() limpia el filtro de fecha", () => {
      cy.get('[data-testid="date-from"]').type("2025-01-01");
      cy.get('[data-testid="date-from"]').clear();
      cy.get('[data-testid="date-from"]').should("have.value", "");
    });
  });

  // ------------------------------------------------------------
  // Análisis de DOM con JSON — cy.request + DOM comparison
  // ------------------------------------------------------------
  describe("Análisis de DOM con JSON", () => {
    it("compara cantidad de filas en DOM con cantidad en la API", () => {
      cy.request("GET", "/api/standings/1").then((response) => {
        const cantidadApi = response.body.data.length;
        cy.visit("/standings");
        cy.get('[data-testid="standings-row"]').should(
          "have.length",
          cantidadApi,
        );
      });
    });

    it("el primer equipo en el DOM coincide con el primero de la API", () => {
      cy.request("GET", "/api/standings/1").then((response) => {
        const primerEquipo = response.body.data[0].team.name;
        cy.visit("/standings");
        cy.get('[data-testid="standings-row"]')
          .first()
          .find('[data-testid="team-name"]')
          .invoke("text")
          .should("include", primerEquipo);
      });
    });

    it("los nombres de jugadores en el DOM coinciden con los de la API", () => {
      cy.request("GET", "/api/players").then((response) => {
        const primerJugador = response.body.data[0].name;
        cy.visit("/players");
        cy.get('[data-testid="player-name"]')
          .first()
          .invoke("text")
          .should("include", primerJugador);
      });
    });
  });
});
