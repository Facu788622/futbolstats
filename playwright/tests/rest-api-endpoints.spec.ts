// ============================================================
// FEATURE: REST API Endpoints (migrated from the Postman collection)
// Test cases: TC-130 to TC-161
// Cypress equivalent: cypress/e2e/rest-api-endpoints.cy.js
//
// The 32 Postman cases, in 4 groups inside a single file:
//   Manual requests                -> TC-130 to TC-136 (Postman cases 1-7)
//   Authentication and writes      -> TC-137 to TC-148 (Postman cases 8-19)
//   Response assertions            -> TC-149 to TC-157 (Postman cases 20-28)
//   Variables and chaining         -> TC-158 to TC-161 (Postman cases 29-32)
//
// Postman cases 33-36 (Collection Runner, CSV, Newman, Jenkins) are not
// ported: `playwright test` covers the runner and the parametrization,
// and Jenkins covers the CI.
//
// Postman -> Playwright equivalences:
//   pm.test / pm.expect        -> test() / expect()
//   {{baseUrl}}                -> const baseUrl
//   pm.environment.set(token)  -> JS variable inside the test
//   {{$randomEmail}}           -> faker.internet.email()
//   Bearer {{token}}           -> ApiClient (tests/support/api.ts) with the token
//
// Backend notes (read from the code):
//   - Errors respond { success:false, error:"...", statusCode }
//     (the text is in `error`, not in `message`).
//   - express-validator validation responds 422 (not 400).
//   - A successful DELETE responds { success:true, message:"..." }.
// ============================================================
import { test, expect } from "./support/fixtures";
import { bodyPartido } from "./support/api";
import usuarioAdmin from "./data/usuario-admin.json";

// TC-158: baseUrl as a variable. Empty = same origin as the Playwright
// baseURL (the frontend proxies /api). To point directly to the backend,
// change it to "http://localhost:3000".
const baseUrl = "";

test.describe("REST API Endpoints", () => {
  // ============================================================
  // Manual requests
  // ============================================================
  test.describe("Manual requests", () => {
    test("TC-130-Verify GET /api/fixtures without auth returns fixtures with homeTeam, awayTeam and league", async ({
      api,
    }) => {
      const res = await api.get("/fixtures");
      const body = await res.json();
      expect(res.status()).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      const fixture = body.data[0];
      expect(fixture).toHaveProperty("homeTeam");
      expect(fixture).toHaveProperty("awayTeam");
      expect(fixture).toHaveProperty("league");
    });

    test("TC-131-Verify GET /api/fixtures/1 (valid path param) returns the fixture", async ({
      api,
    }) => {
      const res = await api.get("/fixtures/1");
      const body = await res.json();
      expect(res.status()).toBe(200);
      expect(typeof body.data).toBe("object");
      expect(body.data).toHaveProperty("id", 1);
    });

    test("TC-132-Verify GET /api/fixtures/9999 (non-existent id) returns 404", async ({
      api,
    }) => {
      const res = await api.get("/fixtures/9999");
      expect(res.status()).toBe(404);
      expect((await res.json()).error).toBe("Partido no encontrado");
    });

    test("TC-133-Verify GET /api/fixtures?status=finished returns only finished fixtures", async ({
      api,
    }) => {
      const res = await api.get("/fixtures", { status: "finished" });
      const body = await res.json();
      expect(res.status()).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      for (const fixture of body.data) {
        expect(fixture.status).toBe("finished");
      }
    });

    test("TC-134-Verify GET /api/fixtures?matchday=1 returns only matchday 1 fixtures", async ({
      api,
    }) => {
      const res = await api.get("/fixtures", { matchday: 1 });
      const body = await res.json();
      expect(res.status()).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      for (const fixture of body.data) {
        expect(Number(fixture.matchday)).toBe(1);
      }
    });

    test("TC-135-Verify GET /api/players without auth returns players with the correct structure", async ({
      api,
    }) => {
      const res = await api.get("/players");
      const body = await res.json();
      expect(res.status()).toBe(200);
      expect(body.data.length).toBeGreaterThan(0);
      const player = body.data[0];
      expect(player).toHaveProperty("name");
      expect(player).toHaveProperty("position");
      expect(player).toHaveProperty("team_id");
    });

    test("TC-136-Verify GET /api/standings/1 without auth returns the standings table", async ({
      api,
    }) => {
      const res = await api.get("/standings/1");
      const body = await res.json();
      expect(res.status()).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // Authentication and writes
  // The `adminToken` fixture provides the admin JWT (login through the API).
  // ============================================================
  test.describe("Authentication and writes", () => {
    test("TC-137-Verify POST /api/auth/login with valid credentials returns a JWT and the user", async ({
      api,
    }) => {
      const res = await api.login(usuarioAdmin.email, usuarioAdmin.password);
      const body = await res.json();
      expect(res.status()).toBe(200);
      expect(body.data.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      expect(body.data.user).toHaveProperty("email", usuarioAdmin.email);
    });

    test("TC-138-Verify POST /api/auth/login with a wrong password returns 401", async ({
      api,
    }) => {
      const res = await api.login(usuarioAdmin.email, "wrong-password");
      expect(res.status()).toBe(401);
      expect((await res.json()).error).toBe("Credenciales inválidas");
    });

    test("TC-139-Verify POST /api/auth/login without a password is rejected by validation with 422", async ({
      api,
    }) => {
      const res = await api.post("/auth/login", { email: usuarioAdmin.email });
      // Postman expected 400; the backend (express-validator + validate.js) responds 422
      expect(res.status()).toBe(422);
      expect((await res.json()).success).toBe(false);
    });

    test("TC-140-Verify POST /api/auth/register with a new email returns 201, a token and the viewer role", async ({
      api,
    }) => {
      const res = await api.registrarUsuarioNuevo();
      const body = await res.json();
      expect(res.status()).toBe(201);
      expect(typeof body.data.token).toBe("string");
      expect(body.data.token.length).toBeGreaterThan(0);
      expect(body.data.user).toHaveProperty("role", "viewer");
    });

    test("TC-141-Verify POST /api/auth/register with an existing email returns 409", async ({
      api,
    }) => {
      const res = await api.post("/auth/register", {
        email: usuarioAdmin.email,
        password: "Test1234!",
      });
      expect(res.status()).toBe(409);
      expect((await res.json()).error).toBe("El email ya está registrado");
    });

    test("TC-142-Verify POST /api/fixtures without a Bearer token returns 401", async ({
      api,
    }) => {
      const res = await api.post("/fixtures", bodyPartido());
      expect(res.status()).toBe(401);
      expect((await res.json()).error).toBe("Token no proporcionado");
    });

    test("TC-143-Verify POST /api/fixtures as admin creates a scheduled fixture with null scores", async ({
      api,
      adminToken,
    }) => {
      const res = await api.post("/fixtures", bodyPartido(), adminToken);
      const body = await res.json();
      expect(res.status()).toBe(201);
      expect(body.data.status).toBe("scheduled");
      expect(body.data.home_score).toBeNull();
      expect(body.data.away_score).toBeNull();
      // Cleanup: do not leave the created fixture in the database
      await api.eliminarPartido(adminToken, body.data.id);
    });

    test("TC-144-Verify POST /api/fixtures with a viewer user token returns 403", async ({
      api,
    }) => {
      // A newly registered user is a viewer (TC-140)
      const registration = await (await api.registrarUsuarioNuevo()).json();
      const viewerToken = registration.data.token;

      const res = await api.post("/fixtures", bodyPartido(), viewerToken);
      expect(res.status()).toBe(403);
      expect((await res.json()).error).toBe("Acceso denegado: se requiere rol admin");
    });

    test("TC-145-Verify PUT /api/fixtures/:id with a full body updates the fixture to 2-1 finished", async ({
      api,
      adminToken,
    }) => {
      const id = await api.crearPartido(adminToken);
      // PUT replaces the resource: it requires all fields
      const res = await api.put(
        `/fixtures/${id}`,
        bodyPartido({ home_score: 2, away_score: 1, status: "finished" }),
        adminToken,
      );
      const body = await res.json();
      expect(res.status()).toBe(200);
      expect(body.data.status).toBe("finished");
      expect(body.data.home_score).toBe(2);
      expect(body.data.away_score).toBe(1);
      expect(body.data).toHaveProperty("homeTeam");
      expect(body.data).toHaveProperty("awayTeam");
      expect(body.data).toHaveProperty("league");
      await api.eliminarPartido(adminToken, id);
    });

    test("TC-146-Verify DELETE /api/fixtures/:id as admin deletes the fixture", async ({
      api,
      adminToken,
    }) => {
      const id = await api.crearPartido(adminToken);
      const res = await api.delete(`/fixtures/${id}`, adminToken);
      expect(res.status()).toBe(200);
      expect((await res.json()).message).toBe("Partido eliminado correctamente");
    });

    test("TC-147-Verify DELETE /api/fixtures/999 (non-existent) as admin returns 404", async ({
      api,
      adminToken,
    }) => {
      const res = await api.delete("/fixtures/999", adminToken);
      expect(res.status()).toBe(404);
      expect((await res.json()).error).toBe("Partido no encontrado");
    });

    test("TC-148-Verify DELETE /api/fixtures/999 without a token returns 401", async ({
      api,
    }) => {
      const res = await api.delete("/fixtures/999");
      expect(res.status()).toBe(401);
      expect((await res.json()).error).toBe("Token no proporcionado");
    });
  });

  // ============================================================
  // Response assertions (equivalent to the pm.test / pm.expect scripts)
  // ============================================================
  test.describe("Response assertions", () => {
    test("TC-149-Verify GET /api/fixtures responds with status 200", async ({ api }) => {
      const res = await api.get("/fixtures");
      expect(res.status()).toBe(200);
      await expect(res).toBeOK();
    });

    test("TC-150-Verify GET /api/fixtures/1 data has the id, status and matchday properties", async ({
      api,
    }) => {
      const json = await (await api.get("/fixtures/1")).json();
      expect(json.data).toHaveProperty("id");
      expect(json.data).toHaveProperty("status");
      expect(json.data).toHaveProperty("matchday");
    });

    test("TC-151-Verify GET /api/players data is a non-empty array", async ({ api }) => {
      const json = await (await api.get("/players")).json();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data).not.toHaveLength(0);
    });

    test("TC-152-Verify GET /api/fixtures/1 data.status is a string", async ({ api }) => {
      const json = await (await api.get("/fixtures/1")).json();
      expect(typeof json.data.status).toBe("string");
    });

    test("TC-153-Verify GET /api/standings/1 data[0].points is a number", async ({ api }) => {
      const json = await (await api.get("/standings/1")).json();
      expect(typeof json.data[0].points).toBe("number");
    });

    test("TC-154-Verify POST /api/auth/login success is a boolean", async ({ api }) => {
      const res = await api.login(usuarioAdmin.email, usuarioAdmin.password);
      expect(typeof (await res.json()).success).toBe("boolean");
    });

    test("TC-155-Verify GET /api/fixtures/1 has a nested homeTeam with a string name", async ({
      api,
    }) => {
      const json = await (await api.get("/fixtures/1")).json();
      expect(json.data.homeTeam).toBeDefined();
      expect(typeof json.data.homeTeam.name).toBe("string");
    });

    test("TC-156-Verify GET /api/players contains player id 1 with the expected name", async ({
      api,
    }) => {
      const json = await (await api.get("/players")).json();
      const player = json.data.find((item: { id: number }) => item.id === 1);
      expect(player).toBeDefined();
      expect(typeof player.name).toBe("string");
      // Seeder value (20240101000005-seed-players.js): id 1 = first inserted player
      expect(player.name).toBe("Franco Armani");
    });

    test("TC-157-Verify GET /api/fixtures returns numeric ids", async ({ api }) => {
      const json = await (await api.get("/fixtures")).json();
      const ids = json.data.map((item: { id: number }) => item.id);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids.every((id: unknown) => typeof id === "number")).toBe(true);
    });
  });

  // ============================================================
  // Variables and chaining
  // ============================================================
  test.describe("Variables and chaining", () => {
    test("TC-158-Verify the baseUrl variable resolves in requests and returns 200", async ({
      request,
    }) => {
      // Equivalent to {{baseUrl}}/api/... : the URL is built from the variable
      const res = await request.get(`${baseUrl}/api/fixtures`);
      expect(res.status()).toBe(200);
    });

    test("TC-159-Verify the saved token is reused and updated on each login", async ({
      api,
    }) => {
      // Equivalent to pm.environment.set("token", ...) in the login Post-response
      const login = await api.login(usuarioAdmin.email, usuarioAdmin.password);
      let savedToken: string = (await login.json()).data.token;

      // Next request: uses {{token}} without touching it manually
      const me = await api.get("/auth/me", undefined, savedToken);
      expect(me.status()).toBe(200);
      expect((await me.json()).data.email).toBe(usuarioAdmin.email);

      // New login with another user: the saved token is replaced
      const registration = await (await api.registrarUsuarioNuevo()).json();
      savedToken = registration.data.token;

      const meNew = await api.get("/auth/me", undefined, savedToken);
      expect((await meNew.json()).data.email).toBe(registration.data.user.email);
    });

    test("TC-160-Verify registering with random emails returns 201 on every execution", async ({
      api,
    }) => {
      expect((await api.registrarUsuarioNuevo()).status()).toBe(201);
      expect((await api.registrarUsuarioNuevo()).status()).toBe(201);
    });

    test("TC-161-Verify the chained CRUD flow: login, create, read, update, delete", async ({
      api,
    }) => {
      // Variables equivalent to {{token}} and {{fixtureId}} in Postman
      // 1. Login -> save token
      const token = await api.obtenerTokenAdmin();

      // 2. POST fixture -> save fixtureId
      const created = await api.post("/fixtures", bodyPartido(), token);
      expect(created.status()).toBe(201);
      const fixtureId: number = (await created.json()).data.id;

      // 3. GET fixture by fixtureId -> verified
      const read = await api.get(`/fixtures/${fixtureId}`);
      const readBody = await read.json();
      expect(read.status()).toBe(200);
      expect(readBody.data.id).toBe(fixtureId);
      expect(readBody.data.status).toBe("scheduled");

      // 4. PUT fixture -> updated result
      const updated = await api.put(
        `/fixtures/${fixtureId}`,
        bodyPartido({ home_score: 2, away_score: 1, status: "finished" }),
        token,
      );
      expect(updated.status()).toBe(200);
      expect((await updated.json()).data.status).toBe("finished");

      // 5. DELETE fixture -> deleted successfully
      const deleted = await api.delete(`/fixtures/${fixtureId}`, token);
      expect(deleted.status()).toBe(200);
      expect((await deleted.json()).message).toBe("Partido eliminado correctamente");

      // 6. (extra) the deleted fixture can no longer be found
      expect((await api.get(`/fixtures/${fixtureId}`)).status()).toBe(404);
    });
  });
});
