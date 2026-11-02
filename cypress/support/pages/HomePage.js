// ============================================================
// HomePage - /
// ============================================================
import selectores from "../../fixtures/selectors.json";

const sel = selectores.comun;

const homePage = {
  visit: () => cy.visit("/"),

  main: () => cy.get(sel.main),
};

export default homePage;
