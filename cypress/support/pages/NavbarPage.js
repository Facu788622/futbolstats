// ============================================================
// NavbarPage - navigation bar present in every view
// ============================================================
import selectores from "../../fixtures/selectors.json";

const sel = selectores.comun;

const navbar = {
  // Queries
  nav: () => cy.get(sel.nav),
  contenedor: () => cy.get(sel.navbar),
  links: () => cy.get(sel.navLinks),
  linksLista: () => cy.get(sel.navListLinks),
  link: (href) => cy.get(`a[href='${href}']`),
  botonLogout: () => cy.get(sel.logout),

  // Actions
  clickEnLink: (href) => navbar.link(href).click(),
};

export default navbar;
