// ============================================================
// LoginPage - /login
// Navigation, locators and actions specific to the login page.
// It contains NO assertions: those stay in the tests.
// (Equivalent to cypress/support/pages/LoginPage.js)
// ============================================================
import { Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly inputEmail: Locator;
  readonly inputPassword: Locator;
  readonly botonSubmit: Locator;

  constructor(private readonly page: Page) {
    this.inputEmail = page.locator("input[type='email']");
    this.inputPassword = page.locator("input[type='password']");
    this.botonSubmit = page.locator("button[type='submit']");
  }

  async visit() {
    await this.page.goto("/login");
  }

  async completarFormulario(email: string, password: string) {
    await this.inputEmail.fill(email);
    await this.inputPassword.fill(password);
  }

  async submit() {
    await this.botonSubmit.click();
  }

  // Full flow: visit + fill + submit
  async login(email: string, password: string) {
    await this.visit();
    await this.completarFormulario(email, password);
    await this.submit();
  }
}
