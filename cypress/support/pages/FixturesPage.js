// ============================================================
// FixturesPage - /fixtures and /fixtures/:id
// ============================================================
import selectores from "../../fixtures/selectors.json";

const sel = selectores.fixtures;

const fixturesPage = {
  visit: () => cy.visit("/fixtures"),
  visitarDetalle: (id) => cy.visit(`/fixtures/${id}`),

  // Queries - list
  tarjetas: () => cy.get(sel.card),
  primeraTarjeta: () => fixturesPage.tarjetas().first(),
  mensajeError: () => cy.get(sel.errorMessage),

  // Queries - date filter
  fechaDesde: () => cy.get(sel.dateFrom),
  fechaHasta: () => cy.get(sel.dateTo),
  botonAplicarFiltroFecha: () => cy.get(sel.applyDateFilter),

  // Queries - fixture detail
  sliderMinuto: () => cy.get(sel.minuteSlider),
  valorMinuto: () => cy.get(sel.minuteValue),

  // Actions
  filtrarPorFechas: (desde, hasta) => {
    fixturesPage.fechaDesde().type(desde);
    fixturesPage.fechaHasta().type(hasta);
    fixturesPage.botonAplicarFiltroFecha().click();
  },
};

export default fixturesPage;
