// ============================================================
// HomePage - /
// ============================================================
import { Locator, Page } from "@playwright/test";

export class HomePage {
  readonly main: Locator;

  constructor(private readonly page: Page) {
    this.main = page.locator("main");
  }

  async visit() {
    await this.page.goto("/");
  }
}
