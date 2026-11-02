// ============================================================
// StandingsPage - /standings (standings table)
// ============================================================
import selectores from "../../fixtures/selectors.json";

const sel = selectores.standings;

const standingsPage = {
  visit: () => cy.visit("/standings"),

  // Structure queries
  tabla: () => cy.get(sel.tabla),
  tbody: () => cy.get(sel.tbody),
  filas: () => cy.get(sel.fila),
  fila: (indice) => standingsPage.filas().eq(indice),
  primeraFila: () => standingsPage.filas().first(),
  ultimaFila: () => standingsPage.filas().last(),
  linksEquipos: () => cy.get(sel.teamLink),

  // Cell queries.
  // nombre: "position" | "teamName" | "points" | "wins" | "draws"
  celda: (indice, nombre) => standingsPage.fila(indice).find(sel[nombre]),
  obtenerPrimerEquipo: () => standingsPage.celda(0, "teamName"),

  // Reads from an already resolved row (jQuery object), useful inside
  // each() / then(). Returns the text of the cell.
  leerCelda: ($fila, nombre) => $fila.find(sel[nombre]).text(),
};

export default standingsPage;
