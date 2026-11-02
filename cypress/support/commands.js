// ============================================================
// cypress/support/commands.js
// Custom commands for FutbolStats
// TRANSVERSAL actions only (used across the whole suite).
// Page-specific logic lives in cypress/support/pages/.
// ============================================================
import loginPage from "./pages/LoginPage";
import navbar from "./pages/NavbarPage";

// ------------------------------------------------------------
// cy.loginComoAdmin()
// Logs in with the administrator credentials
// ------------------------------------------------------------
Cypress.Commands.add("loginComoAdmin", () => {
  cy.session("admin-session", () => {
    loginPage.login("admin@futbolstats.com", "admin1234");
    cy.url().should("not.include", "/login");
  });
});

// ------------------------------------------------------------
// cy.login(email, password)
// Logs in with arbitrary credentials
// ------------------------------------------------------------
Cypress.Commands.add("login", (email, password) => {
  cy.session(email, () => {
    loginPage.login(email, password);
    cy.url().should("not.include", "/login");
  });
});

// ------------------------------------------------------------
// cy.cerrarSesion()
// Logs out from the navbar
// ------------------------------------------------------------
Cypress.Commands.add("cerrarSesion", () => {
  navbar.botonLogout().click();
  cy.url().should("include", "/login");
});

// ------------------------------------------------------------
// cy.obtenerTokenAdmin()
// Gets an admin JWT through the API, without going through the UI.
// Useful for tests that need auth but do not test the login itself
// ------------------------------------------------------------
Cypress.Commands.add("obtenerTokenAdmin", () => {
  cy.request("POST", "/api/auth/login", {
    email: "admin@futbolstats.com",
    password: "admin1234",
  }).then((response) => {
    window.localStorage.setItem("token", response.body.data.token);
  });
});
