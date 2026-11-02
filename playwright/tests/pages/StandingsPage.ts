// ============================================================
// StandingsPage - /standings (standings table)
// ============================================================
import { Locator, Page } from "@playwright/test";

// Row cells and their data-testid
export type NombreCelda = "position" | "teamName" | "points" | "wins" | "draws";

const TEST_ID_CELDA: Record<NombreCelda, string> = {
  position: "position",
  teamName: "team-name",
  points: "points",
  wins: "wins",
  draws: "draws",
};

export class StandingsPage {
  readonly tabla: Locator;
  readonly tbody: Locator;
  readonly filas: Locator;
  readonly primeraFila: Locator;
  readonly ultimaFila: Locator;
  readonly linksEquipos: Locator;

  constructor(private readonly page: Page) {
    this.tabla = page.locator("table");
    this.tbody = page.locator("table tbody");
    this.filas = page.getByTestId("standings-row");
    this.primeraFila = this.filas.first();
    this.ultimaFila = this.filas.last();
    this.linksEquipos = page.getByTestId("team-link");
  }

  async visit() {
    await this.page.goto("/standings");
  }

  // Row / cell locators
  fila(indice: number): Locator {
    return this.filas.nth(indice);
  }

  celda(indice: number, nombre: NombreCelda): Locator {
    return this.fila(indice).getByTestId(TEST_ID_CELDA[nombre]);
  }

  obtenerPrimerEquipo(): Locator {
    return this.celda(0, "teamName");
  }

  // Cell inside an already resolved row
  celdaEn(fila: Locator, nombre: NombreCelda): Locator {
    return fila.getByTestId(TEST_ID_CELDA[nombre]);
  }

  // Text of a cell inside an already resolved row
  async leerCelda(fila: Locator, nombre: NombreCelda): Promise<string> {
    return (await this.celdaEn(fila, nombre).textContent()) ?? "";
  }
}
