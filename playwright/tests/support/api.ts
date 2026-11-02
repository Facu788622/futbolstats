// ============================================================
// ApiClient - helpers for the API suite
// Wraps Playwright's `request` (APIRequestContext) and exposes the same
// operations as the helpers in cypress/e2e/rest-api-endpoints.cy.js.
// Note: Playwright does NOT throw on 4xx/5xx (equivalent to Cypress'
// failOnStatusCode:false), so assertions are made on status().
// ============================================================
import { APIRequestContext, APIResponse, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import usuarioAdmin from "../data/usuario-admin.json";

const API = "/api";

export const bodyPartido = (extra: Record<string, unknown> = {}) => ({
  league_id: 1,
  home_team_id: 1,
  away_team_id: 2,
  date: "2026-12-01T20:00:00.000Z",
  matchday: 99,
  ...extra,
});

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private auth(token?: string) {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  get(
    ruta: string,
    params?: Record<string, string | number>,
    token?: string,
  ): Promise<APIResponse> {
    return this.request.get(`${API}${ruta}`, { params, headers: this.auth(token) });
  }

  post(ruta: string, data: unknown, token?: string): Promise<APIResponse> {
    return this.request.post(`${API}${ruta}`, { data, headers: this.auth(token) });
  }

  put(ruta: string, data: unknown, token?: string): Promise<APIResponse> {
    return this.request.put(`${API}${ruta}`, { data, headers: this.auth(token) });
  }

  delete(ruta: string, token?: string): Promise<APIResponse> {
    return this.request.delete(`${API}${ruta}`, { headers: this.auth(token) });
  }

  login(email: string, password: string): Promise<APIResponse> {
    return this.post("/auth/login", { email, password });
  }

  // Admin JWT defined in tests/data/usuario-admin.json
  async obtenerTokenAdmin(): Promise<string> {
    const res = await this.login(usuarioAdmin.email, usuarioAdmin.password);
    const body = await res.json();
    return body.data.token;
  }

  // Registers a user with a random email (viewer role by default)
  registrarUsuarioNuevo(): Promise<APIResponse> {
    return this.post("/auth/register", {
      email: faker.internet.email().toLowerCase(),
      password: "Test1234!",
    });
  }

  // Creates a fixture and returns its id
  async crearPartido(token: string): Promise<number> {
    const res = await this.post("/fixtures", bodyPartido(), token);
    expect(res.status(), "setup: create fixture").toBe(201);
    return (await res.json()).data.id;
  }

  eliminarPartido(token: string, id: number): Promise<APIResponse> {
    return this.delete(`/fixtures/${id}`, token);
  }
}
