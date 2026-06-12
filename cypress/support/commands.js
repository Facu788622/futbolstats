// ============================================================
// cypress/support/commands.js
// Custom Commands para FutbolStats
// ============================================================

// ------------------------------------------------------------
// cy.loginComoAdmin()
// Inicia sesión con las credenciales del administrador
// ------------------------------------------------------------
Cypress.Commands.add("loginComoAdmin", () => {
  cy.session("admin", () => {
    cy.visit("/login");
    cy.get('input[type="email"]').type("admin@futbolstats.com");
    cy.get('input[type="password"]').type("admin1234");
    cy.get('button[type="submit"]').click();
    cy.url().should("not.include", "/login");
  });
});

// ------------------------------------------------------------
// cy.login(email, password)
// Inicia sesión con credenciales arbitrarias
// ------------------------------------------------------------
Cypress.Commands.add("login", (email, password) => {
  cy.session(email, () => {
    cy.visit("/login");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should("not.include", "/login");
  });
});

// ------------------------------------------------------------
// cy.cerrarSesion()
// Cierra sesión desde la navbar
// ------------------------------------------------------------
Cypress.Commands.add("cerrarSesion", () => {
  cy.get('[data-testid="logout-btn"]').click();
  cy.url().should("include", "/login");
});

// ------------------------------------------------------------
// cy.obtenerTokenAdmin()
// Obtiene un JWT de admin via API, sin pasar por la UI
// Útil para tests que requieren auth pero no testean el login
// ------------------------------------------------------------
Cypress.Commands.add("obtenerTokenAdmin", () => {
  cy.request("POST", "/api/auth/login", {
    email: "admin@futbolstats.com",
    password: "admin1234",
  }).then((response) => {
    window.localStorage.setItem("token", response.body.token);
  });
});

// ------------------------------------------------------------
// cy.verificarFilaStandings(posicion, equipoNombre)
// Verifica que una posición de la tabla tenga el equipo correcto
// ------------------------------------------------------------
Cypress.Commands.add("verificarFilaStandings", (posicion, equipoNombre) => {
  cy.get('[data-testid="standings-row"]')
    .eq(posicion - 1)
    .find('[data-testid="team-name"]')
    .should("include.text", equipoNombre);
});
