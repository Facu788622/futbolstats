// ============================================================
// AdminPage - /admin
// Login is done with cy.loginComoAdmin() (custom command).
// ============================================================
import selectores from "../../fixtures/selectors.json";

const sel = selectores.admin;

const adminPage = {
  visit: () => cy.visit("/admin"),

  // Queries
  panel: () => cy.get(sel.panel),
  checkboxesDestacado: () => cy.get(sel.featuredCheckbox),
  checkboxPorValor: (valor) => cy.get(`${sel.checkbox}[value='${valor}']`),
  itemsArrastrables: () => cy.get(sel.draggableItem),
  botonesEditarJugador: () => cy.get(sel.editPlayerBtn),
  inputArchivo: () => cy.get(sel.fileInput),

  // Actions
  editarUltimoJugador: () => adminPage.botonesEditarJugador().last().click(),
};

export default adminPage;
