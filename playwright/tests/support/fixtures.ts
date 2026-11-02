// ============================================================
// fixtures.ts - Playwright fixtures
// Hands each test the page objects already built on the test `page`, the
// API client and the admin / viewer sessions.
//
// Equivalences with Cypress:
//   cy.loginComoAdmin()      -> `paginaAdmin` fixture (logs in before the test)
//   cy.session(viewer)       -> `paginaViewer` fixture
//   cy.obtenerTokenAdmin     -> `adminToken` fixture
//   cypress/support/pages/*  -> the page objects in tests/pages/*
//
// Tests import { test, expect } from here, not from @playwright/test.
// ============================================================
import { test as base, expect, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { NavbarPage } from "../pages/NavbarPage";
import { HomePage } from "../pages/HomePage";
import { StandingsPage } from "../pages/StandingsPage";
import { PlayersPage } from "../pages/PlayersPage";
import { FixturesPage } from "../pages/FixturesPage";
import { AdminPage } from "../pages/AdminPage";
import { ApiClient } from "./api";
import usuarioAdmin from "../data/usuario-admin.json";
import usuarioRegular from "../data/usuario-regular.json";

type Fixtures = {
  loginPage: LoginPage;
  navbar: NavbarPage;
  homePage: HomePage;
  standingsPage: StandingsPage;
  playersPage: PlayersPage;
  fixturesPage: FixturesPage;
  adminPage: AdminPage;
  api: ApiClient;
  adminToken: string;
  paginaAdmin: Page;
  paginaViewer: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new NavbarPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  standingsPage: async ({ page }, use) => {
    await use(new StandingsPage(page));
  },
  playersPage: async ({ page }, use) => {
    await use(new PlayersPage(page));
  },
  fixturesPage: async ({ page }, use) => {
    await use(new FixturesPage(page));
  },
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },

  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  // Admin JWT obtained through the API (without going through the UI)
  adminToken: async ({ api }, use) => {
    await use(await api.obtenerTokenAdmin());
  },

  // `page` already authenticated as admin (UI login before the test runs)
  paginaAdmin: async ({ page, loginPage }, use) => {
    await loginPage.login(usuarioAdmin.email, usuarioAdmin.password);
    await expect(page).not.toHaveURL(/\/login/);
    await use(page);
  },

  // `page` already authenticated as a viewer user
  paginaViewer: async ({ page, loginPage }, use) => {
    await loginPage.login(usuarioRegular.email, usuarioRegular.password);
    await expect(page).not.toHaveURL(/\/login/);
    await use(page);
  },
});

export { expect };
