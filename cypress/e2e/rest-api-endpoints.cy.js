// ============================================================
// FEATURE: REST API Endpoints (migrated from the Postman collection)
// Test cases: TC-130 to TC-161
// Playwright equivalent: playwright/tests/rest-api-endpoints.spec.ts
//
// The 32 Postman cases, in 4 groups inside a single file:
//   Manual requests                -> TC-130 to TC-136 (Postman cases 1-7)
//   Authentication and writes      -> TC-137 to TC-148 (Postman cases 8-19)
//   Response assertions            -> TC-149 to TC-157 (Postman cases 20-28)
//   Variables and chaining         -> TC-158 to TC-161 (Postman cases 29-32)
//
// Postman cases 33-36 (Collection Runner, CSV, Newman, Jenkins) are not
// ported: in Cypress, `cypress run` + Jenkins already cover the runner,
// the parametrization and the CI.
//
// Postman -> Cypress equivalences:
//   pm.test / pm.expect        -> it() / expect()
//   {{baseUrl}}                -> const baseUrl
//   pm.environment.set(token)  -> shared JS variable between commands
//   {{$randomEmail}}           -> faker.internet.email()
//   Bearer {{token}}           -> headers: { Authorization: `Bearer ${token}` }
//
// Note: cypress.config.js sets allowCypressEnv:false, so Cypress.env() is
// NOT used. The "environment variables" are plain JS variables.
//
// Backend notes (read from the code):
//   - Errors respond { success:false, error:"...", statusCode }
//     (the text is in `error`, not in `message`).
//   - express-validator validation responds 422 (not 400).
//   - A successful DELETE responds { success:true, message:"..." }.
// ============================================================
import { faker } from "@faker-js/faker";

// ------------------------------------------------------------
// Configuration and helpers
// ------------------------------------------------------------
// TC-158: baseUrl as a variable. Empty = same origin as the Cypress baseUrl
// (the frontend proxies /api). To point directly to the backend,
// change it to "http://localhost:3000".
const baseUrl = "";
const API = `${baseUrl}/api`;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

// GET that does not fail on 4xx, so the status can be asserted
const get = (route, qs) =>
  cy.request({ method: "GET", url: `${API}${route}`, qs, failOnStatusCode: false });

const post = (route, body, token) =>
  cy.request({
    method: "POST",
    url: `${API}${route}`,
    body,
    headers: token ? auth(token) : {},
    failOnStatusCode: false,
  });

const put = (route, body, token) =>
  cy.request({
    method: "PUT",
    url: `${API}${route}`,
    body,
    headers: token ? auth(token) : {},
    failOnStatusCode: false,
  });

const del = (route, token) =>
  cy.request({
    method: "DELETE",
    url: `${API}${route}`,
    headers: token ? auth(token) : {},
    failOnStatusCode: false,
  });

const login = (email, password) => post("/auth/login", { email, password });

// Yields the admin JWT defined in cypress/fixtures/usuario-admin.json
const getAdminToken = () =>
  cy
    .fixture("usuario-admin")
    .then((user) => login(user.email, user.password))
    .then((res) => res.body.data.token);

// Registers a user with a random email (viewer role by default)
const registerNewUser = () =>
  post("/auth/register", {
    email: faker.internet.email().toLowerCase(),
    password: "Test1234!",
  });

const fixtureBody = (extra = {}) => ({
  league_id: 1,
  home_team_id: 1,
  away_team_id: 2,
  date: "2026-12-01T20:00:00.000Z",
  matchday: 99,
  ...extra,
});

// Creates a fixture and yields its id
const createFixture = (token) =>
  post("/fixtures", fixtureBody(), token).then((res) => {
    expect(res.status, "setup: create fixture").to.eq(201);
    return res.body.data.id;
  });

const deleteFixture = (token, id) => del(`/fixtures/${id}`, token);

describe("REST API Endpoints", () => {
  // ============================================================
  // Manual requests
  // ============================================================
  describe("Manual requests", () => {
    it("TC-130-Verify GET /api/fixtures without auth returns fixtures with homeTeam, awayTeam and league", () => {
      get("/fixtures").then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.eq(true);
        expect(res.body.data).to.be.an("array").and.not.be.empty;
        const fixture = res.body.data[0];
        expect(fixture).to.have.property("homeTeam");
        expect(fixture).to.have.property("awayTeam");
        expect(fixture).to.have.property("league");
      });
    });

    it("TC-131-Verify GET /api/fixtures/1 (valid path param) returns the fixture", () => {
      get("/fixtures/1").then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.be.an("object");
        expect(res.body.data).to.have.property("id", 1);
      });
    });

    it("TC-132-Verify GET /api/fixtures/9999 (non-existent id) returns 404", () => {
      get("/fixtures/9999").then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.error).to.eq("Partido no encontrado");
      });
    });

    it("TC-133-Verify GET /api/fixtures?status=finished returns only finished fixtures", () => {
      get("/fixtures", { status: "finished" }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.be.an("array");
        res.body.data.forEach((fixture) => {
          expect(fixture.status).to.eq("finished");
        });
      });
    });

    it("TC-134-Verify GET /api/fixtures?matchday=1 returns only matchday 1 fixtures", () => {
      get("/fixtures", { matchday: 1 }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.be.an("array");
        res.body.data.forEach((fixture) => {
          expect(Number(fixture.matchday)).to.eq(1);
        });
      });
    });

    it("TC-135-Verify GET /api/players without auth returns players with the correct structure", () => {
      get("/players").then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.be.an("array").and.not.be.empty;
        const player = res.body.data[0];
        expect(player).to.have.property("name");
        expect(player).to.have.property("position");
        expect(player).to.have.property("team_id");
      });
    });

    it("TC-136-Verify GET /api/standings/1 without auth returns the standings table", () => {
      get("/standings/1").then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.be.an("array").and.not.be.empty;
      });
    });
  });

  // ============================================================
  // Authentication and writes
  // ============================================================
  describe("Authentication and writes", () => {
    let adminToken;

    before(() => {
      getAdminToken().then((token) => {
        adminToken = token;
      });
    });

    it("TC-137-Verify POST /api/auth/login with valid credentials returns a JWT and the user", () => {
      cy.fixture("usuario-admin").then((user) => {
        login(user.email, user.password).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.data.token).to.match(/^[\w-]+\.[\w-]+\.[\w-]+$/);
          expect(res.body.data.user).to.have.property("email", user.email);
        });
      });
    });

    it("TC-138-Verify POST /api/auth/login with a wrong password returns 401", () => {
      cy.fixture("usuario-admin").then((user) => {
        login(user.email, "wrong-password").then((res) => {
          expect(res.status).to.eq(401);
          expect(res.body.error).to.eq("Credenciales inválidas");
        });
      });
    });

    it("TC-139-Verify POST /api/auth/login without a password is rejected by validation with 422", () => {
      cy.fixture("usuario-admin").then((user) => {
        post("/auth/login", { email: user.email }).then((res) => {
          // Postman expected 400; the backend (express-validator + validate.js) responds 422
          expect(res.status).to.eq(422);
          expect(res.body.success).to.eq(false);
        });
      });
    });

    it("TC-140-Verify POST /api/auth/register with a new email returns 201, a token and the viewer role", () => {
      registerNewUser().then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.data.token).to.be.a("string").and.not.be.empty;
        expect(res.body.data.user).to.have.property("role", "viewer");
      });
    });

    it("TC-141-Verify POST /api/auth/register with an existing email returns 409", () => {
      cy.fixture("usuario-admin").then((user) => {
        post("/auth/register", {
          email: user.email,
          password: "Test1234!",
        }).then((res) => {
          expect(res.status).to.eq(409);
          expect(res.body.error).to.eq("El email ya está registrado");
        });
      });
    });

    it("TC-142-Verify POST /api/fixtures without a Bearer token returns 401", () => {
      post("/fixtures", fixtureBody()).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.error).to.eq("Token no proporcionado");
      });
    });

    it("TC-143-Verify POST /api/fixtures as admin creates a scheduled fixture with null scores", () => {
      post("/fixtures", fixtureBody(), adminToken).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.data.status).to.eq("scheduled");
        expect(res.body.data.home_score).to.eq(null);
        expect(res.body.data.away_score).to.eq(null);
        // Cleanup: do not leave the created fixture in the database
        deleteFixture(adminToken, res.body.data.id);
      });
    });

    it("TC-144-Verify POST /api/fixtures with a viewer user token returns 403", () => {
      // A newly registered user is a viewer (TC-140)
      registerNewUser().then((registration) => {
        const viewerToken = registration.body.data.token;
        post("/fixtures", fixtureBody(), viewerToken).then((res) => {
          expect(res.status).to.eq(403);
          expect(res.body.error).to.eq("Acceso denegado: se requiere rol admin");
        });
      });
    });

    it("TC-145-Verify PUT /api/fixtures/:id with a full body updates the fixture to 2-1 finished", () => {
      createFixture(adminToken).then((id) => {
        // PUT replaces the resource: it requires all fields
        put(
          `/fixtures/${id}`,
          fixtureBody({ home_score: 2, away_score: 1, status: "finished" }),
          adminToken,
        ).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.data.status).to.eq("finished");
          expect(res.body.data.home_score).to.eq(2);
          expect(res.body.data.away_score).to.eq(1);
          expect(res.body.data).to.have.property("homeTeam");
          expect(res.body.data).to.have.property("awayTeam");
          expect(res.body.data).to.have.property("league");
          deleteFixture(adminToken, id);
        });
      });
    });

    it("TC-146-Verify DELETE /api/fixtures/:id as admin deletes the fixture", () => {
      createFixture(adminToken).then((id) => {
        del(`/fixtures/${id}`, adminToken).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.message).to.eq("Partido eliminado correctamente");
        });
      });
    });

    it("TC-147-Verify DELETE /api/fixtures/999 (non-existent) as admin returns 404", () => {
      del("/fixtures/999", adminToken).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.error).to.eq("Partido no encontrado");
      });
    });

    it("TC-148-Verify DELETE /api/fixtures/999 without a token returns 401", () => {
      del("/fixtures/999").then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.error).to.eq("Token no proporcionado");
      });
    });
  });

  // ============================================================
  // Response assertions (equivalent to the pm.test / pm.expect scripts)
  // ============================================================
  describe("Response assertions", () => {
    it("TC-149-Verify GET /api/fixtures responds with status 200", () => {
      get("/fixtures").then((res) => {
        expect(res).to.have.property("status", 200);
      });
    });

    it("TC-150-Verify GET /api/fixtures/1 data has the id, status and matchday properties", () => {
      get("/fixtures/1").then((res) => {
        const json = res.body;
        expect(json.data).to.have.property("id");
        expect(json.data).to.have.property("status");
        expect(json.data).to.have.property("matchday");
      });
    });

    it("TC-151-Verify GET /api/players data is a non-empty array", () => {
      get("/players").then((res) => {
        expect(res.body.data).to.be.an("array");
        expect(res.body.data).to.not.be.empty;
      });
    });

    it("TC-152-Verify GET /api/fixtures/1 data.status is a string", () => {
      get("/fixtures/1").then((res) => {
        expect(res.body.data.status).to.be.a("string");
      });
    });

    it("TC-153-Verify GET /api/standings/1 data[0].points is a number", () => {
      get("/standings/1").then((res) => {
        expect(res.body.data[0].points).to.be.a("number");
      });
    });

    it("TC-154-Verify POST /api/auth/login success is a boolean", () => {
      cy.fixture("usuario-admin").then((user) => {
        login(user.email, user.password).then((res) => {
          expect(res.body.success).to.be.a("boolean");
        });
      });
    });

    it("TC-155-Verify GET /api/fixtures/1 has a nested homeTeam with a string name", () => {
      get("/fixtures/1").then((res) => {
        expect(res.body.data.homeTeam).to.exist;
        expect(res.body.data.homeTeam.name).to.be.a("string");
      });
    });

    it("TC-156-Verify GET /api/players contains player id 1 with the expected name", () => {
      get("/players").then((res) => {
        const player = res.body.data.find((item) => item.id === 1);
        expect(player).to.exist;
        expect(player.name).to.be.a("string");
        // Seeder value (20240101000005-seed-players.js): id 1 = first inserted player
        expect(player.name).to.eq("Franco Armani");
      });
    });

    it("TC-157-Verify GET /api/fixtures returns numeric ids", () => {
      get("/fixtures").then((res) => {
        const ids = res.body.data.map((item) => item.id);
        expect(ids).to.not.be.empty;
        expect(ids.every((id) => typeof id === "number")).to.eq(true);
      });
    });
  });

  // ============================================================
  // Variables and chaining
  // ============================================================
  describe("Variables and chaining", () => {
    it("TC-158-Verify the baseUrl variable resolves in requests and returns 200", () => {
      // Equivalent to {{baseUrl}}/api/... : the URL is built from the variable
      cy.request(`${baseUrl}/api/fixtures`).then((res) => {
        expect(res.status).to.eq(200);
      });
    });

    it("TC-159-Verify the saved token is reused and updated on each login", () => {
      // Equivalent to pm.environment.set("token", ...) in the login Post-response
      let savedToken;

      cy.fixture("usuario-admin").then((user) => {
        login(user.email, user.password).then((res) => {
          savedToken = res.body.data.token;
        });

        // Next request: uses {{token}} without touching it manually
        cy.then(() =>
          cy.request({
            method: "GET",
            url: `${API}/auth/me`,
            headers: auth(savedToken),
          }),
        ).then((me) => {
          expect(me.status).to.eq(200);
          expect(me.body.data.email).to.eq(user.email);
        });
      });

      // New login with another user: the saved token is replaced
      registerNewUser().then((registration) => {
        const newEmail = registration.body.data.user.email;
        savedToken = registration.body.data.token;

        cy.then(() =>
          cy.request({
            method: "GET",
            url: `${API}/auth/me`,
            headers: auth(savedToken),
          }),
        ).then((me) => {
          expect(me.body.data.email).to.eq(newEmail);
        });
      });
    });

    it("TC-160-Verify registering with random emails returns 201 on every execution", () => {
      registerNewUser().then((res) => {
        expect(res.status).to.eq(201);
      });
      registerNewUser().then((res) => {
        expect(res.status).to.eq(201);
      });
    });

    it("TC-161-Verify the chained CRUD flow: login, create, read, update, delete", () => {
      // Variables equivalent to {{token}} and {{fixtureId}} in Postman
      let token;
      let fixtureId;

      // 1. Login -> save token
      getAdminToken().then((t) => {
        token = t;
      });

      // 2. POST fixture -> save fixtureId
      cy.then(() => post("/fixtures", fixtureBody(), token)).then((res) => {
        expect(res.status).to.eq(201);
        fixtureId = res.body.data.id;
      });

      // 3. GET fixture by fixtureId -> verified
      cy.then(() => get(`/fixtures/${fixtureId}`)).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.id).to.eq(fixtureId);
        expect(res.body.data.status).to.eq("scheduled");
      });

      // 4. PUT fixture -> updated result
      cy.then(() =>
        put(
          `/fixtures/${fixtureId}`,
          fixtureBody({ home_score: 2, away_score: 1, status: "finished" }),
          token,
        ),
      ).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.status).to.eq("finished");
      });

      // 5. DELETE fixture -> deleted successfully
      cy.then(() => del(`/fixtures/${fixtureId}`, token)).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.message).to.eq("Partido eliminado correctamente");
      });

      // 6. (extra) the deleted fixture can no longer be found
      cy.then(() => get(`/fixtures/${fixtureId}`)).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });
});
