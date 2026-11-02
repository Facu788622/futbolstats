// ============================================================
// PlayersPage - /players
// ============================================================
import { Locator, Page } from "@playwright/test";

export class PlayersPage {
  readonly tarjetas: Locator;
  readonly nombres: Locator;
  readonly filtroPosicion: Locator;

  constructor(private readonly page: Page) {
    this.tarjetas = page.getByTestId("player-card");
    this.nombres = page.getByTestId("player-name");
    this.filtroPosicion = page.getByTestId("position-filter");
  }

  async visit() {
    await this.page.goto("/players");
  }

  // posicion: "GK" | "DEF" | "MID" | "FWD" | "Todos"
  async filtrarPorPosicion(posicion: string) {
    await this.filtroPosicion.selectOption(posicion);
  }

  // On an already resolved card
  nombreEn(tarjeta: Locator): Locator {
    return tarjeta.getByTestId("player-name");
  }

  async leerNombre(tarjeta: Locator): Promise<string> {
    return (await this.nombreEn(tarjeta).textContent()) ?? "";
  }
}
