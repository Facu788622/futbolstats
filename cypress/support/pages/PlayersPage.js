// ============================================================
// PlayersPage - /players
// ============================================================
import selectores from "../../fixtures/selectors.json";

const sel = selectores.players;

const playersPage = {
  visit: () => cy.visit("/players"),

  // Queries
  tarjetas: () => cy.get(sel.card),
  nombres: () => cy.get(sel.name),
  filtroPosicion: () => cy.get(sel.positionFilter),

  // Actions
  // posicion: "GK" | "DEF" | "MID" | "FWD" | "Todos"
  filtrarPorPosicion: (posicion) => playersPage.filtroPosicion().select(posicion),

  // On an already resolved card (jQuery object)
  leerNombre: ($tarjeta) => $tarjeta.find(sel.name).text(),
  nombreEn: ($tarjeta) => cy.wrap($tarjeta).find(sel.name),
};

export default playersPage;
