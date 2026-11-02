// ============================================================
// NavbarPage - navigation bar present in every view
// ============================================================
import { Locator, Page } from "@playwright/test";

export class NavbarPage {
  readonly nav: Locator;
  readonly contenedor: Locator;
  readonly links: Locator;
  readonly linksLista: Locator;
  readonly botonLogout: Locator;

  constructor(private readonly page: Page) {
    this.nav = page.locator("nav").first();
    this.contenedor = page.getByTestId("navbar");
    this.links = page.locator("nav a");
    this.linksLista = page.locator("nav ul a");
    this.botonLogout = page.getByTestId("logout-btn");
  }

  link(href: string): Locator {
    return this.page.locator(`a[href='${href}']`).first();
  }

  async clickEnLink(href: string) {
    await this.link(href).click();
  }
}
