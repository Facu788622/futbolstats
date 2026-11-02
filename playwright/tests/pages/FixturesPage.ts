// ============================================================
// FixturesPage - /fixtures and /fixtures/:id
// ============================================================
import { Locator, Page } from "@playwright/test";

export class FixturesPage {
  // List
  readonly tarjetas: Locator;
  readonly primeraTarjeta: Locator;
  readonly mensajeError: Locator;
  // Date filter
  readonly fechaDesde: Locator;
  readonly fechaHasta: Locator;
  readonly botonAplicarFiltroFecha: Locator;
  // Fixture detail
  readonly sliderMinuto: Locator;
  readonly valorMinuto: Locator;

  constructor(private readonly page: Page) {
    this.tarjetas = page.getByTestId("fixture-card");
    this.primeraTarjeta = this.tarjetas.first();
    this.mensajeError = page.getByTestId("error-message");
    this.fechaDesde = page.getByTestId("date-from");
    this.fechaHasta = page.getByTestId("date-to");
    this.botonAplicarFiltroFecha = page.getByTestId("apply-date-filter");
    this.sliderMinuto = page.getByTestId("minute-slider");
    this.valorMinuto = page.getByTestId("minute-value");
  }

  async visit() {
    await this.page.goto("/fixtures");
  }

  async visitarDetalle(id: number) {
    await this.page.goto(`/fixtures/${id}`);
  }

  async filtrarPorFechas(desde: string, hasta: string) {
    await this.fechaDesde.fill(desde);
    await this.fechaHasta.fill(hasta);
    await this.botonAplicarFiltroFecha.click();
  }
}
