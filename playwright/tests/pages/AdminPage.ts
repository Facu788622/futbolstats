// ============================================================
// AdminPage - /admin
// Login is handled by the `paginaAdmin` fixture (see tests/support/fixtures.ts).
// ============================================================
import { Locator, Page } from "@playwright/test";

export class AdminPage {
  readonly panel: Locator;
  readonly checkboxesDestacado: Locator;
  readonly itemsArrastrables: Locator;
  readonly botonesEditarJugador: Locator;
  readonly inputArchivo: Locator;

  constructor(private readonly page: Page) {
    this.panel = page.getByTestId("admin-panel");
    this.checkboxesDestacado = page.getByTestId("fixture-featured-checkbox");
    this.itemsArrastrables = page.getByTestId("draggable-item");
    this.botonesEditarJugador = page.getByTestId("edit-player-btn");
    this.inputArchivo = page.locator("input[type='file']");
  }

  async visit() {
    await this.page.goto("/admin");
  }

  checkboxPorValor(valor: string): Locator {
    return this.page.locator(`input[type='checkbox'][value='${valor}']`);
  }

  async editarUltimoJugador() {
    await this.botonesEditarJugador.last().click();
  }
}
