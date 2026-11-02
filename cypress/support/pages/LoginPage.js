// ============================================================
// LoginPage - /login
// Navigation, queries and actions specific to the login page.
// It contains NO assertions: those stay in the tests.
// ============================================================
import selectores from "../../fixtures/selectors.json";

const sel = selectores.login;

const loginPage = {
  visit: () => cy.visit("/login"),

  // Queries (they return the Cypress chain, without asserting anything)
  inputEmail: () => cy.get(sel.email),
  inputPassword: () => cy.get(sel.password),
  botonSubmit: () => cy.get(sel.submit),

  // Actions
  completarFormulario: (email, password) => {
    loginPage.inputEmail().type(email);
    loginPage.inputPassword().type(password);
  },

  submit: () => loginPage.botonSubmit().click(),

  // Full flow: visit + fill + submit
  login: (email, password) => {
    loginPage.visit();
    loginPage.completarFormulario(email, password);
    loginPage.submit();
  },
};

export default loginPage;
