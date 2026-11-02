// ============================================================
// FEATURE: Database Queries and Integrity (migrated from MySQL Workbench)
// Test cases: TC-162 to TC-196
// Cypress equivalent: cypress/e2e/database-queries-and-integrity.cy.js
//
// The SQL cases, in 4 groups inside a single file (in the original order):
//   Basic queries            -> TC-162 to TC-170 (SQL cases 1-8, plus 4 completed)
//   Data analysis            -> TC-171 to TC-180 (SQL cases 9-17)
//   Relationships            -> TC-181 to TC-190 (SQL cases 18-25, plus 19b and 23b)
//   Advanced validations     -> TC-191 to TC-196 (SQL cases 26-31)
//
// Difference with Cypress: here the tests run in Node, so they query MySQL
// directly with query() (tests/support/db.ts); no task (cy.task) is needed.
// Only read queries are allowed.
//
// Assertion criteria: the database changes (fixtures are created/deleted),
// so exact counts ("8 teams", "6 fixtures") are NOT hardcoded. Structure and
// invariants are verified instead: filters that hold for every row, empty
// results where they must be empty, and consistency between queries.
// The values obtained in Workbench are kept as a comment in each case.
//
// This suite runs in the "database" project, which depends on "api" so it
// does not run while the API suite is creating and deleting fixtures.
// ============================================================
import { test, expect } from "@playwright/test";
import { consulta as query } from "./support/db";

test.describe("Database Queries and Integrity", () => {
  // ============================================================
  // Basic queries
  // ============================================================
  test.describe("Basic queries", () => {
    test("TC-162-Verify SELECT * FROM teams returns teams with the expected columns", async () => {
      // Workbench: 8 rows
      const rows = await query("SELECT * FROM teams");
      expect(rows.length).toBeGreaterThan(0);
      for (const column of [
        "id",
        "name",
        "short_name",
        "logo_url",
        "league_id",
        "created_at",
        "updated_at",
      ]) {
        expect(rows[0]).toHaveProperty(column);
      }
    });

    test("TC-163-Verify SELECT * FROM fixtures returns fixtures with status, teams, date and scores", async () => {
      const rows = await query("SELECT * FROM fixtures");
      expect(rows.length).toBeGreaterThan(0);
      for (const column of [
        "id",
        "home_team_id",
        "away_team_id",
        "status",
        "date",
        "matchday",
        "home_score",
        "away_score",
      ]) {
        expect(rows[0]).toHaveProperty(column);
      }
    });

    test("TC-164-Verify filtering fixtures by status 'finished' returns only finished fixtures", async () => {
      // Workbench: 6 rows
      const rows = await query("SELECT * FROM fixtures WHERE status = 'finished'");
      expect(rows.length).toBeGreaterThan(0);
      for (const f of rows) expect(f.status).toBe("finished");
    });

    test("TC-165-Verify goals live in fixture_events and each goal references a player", async () => {
      // Exploratory query of the case: goals are not stored in players
      const rows = await query("SELECT player_id FROM fixture_events WHERE type = 'goal'");
      expect(rows.length).toBeGreaterThan(0);
      for (const f of rows) expect(f).toHaveProperty("player_id");
    });

    test("TC-166-Verify players with more than 5 goals using GROUP BY and HAVING", async () => {
      // Completes the case that had been left open. It may return 0 rows
      // if no player has more than 5 goals; what is validated is the threshold.
      const rows = await query(
        `SELECT player_id, COUNT(*) AS goals
         FROM fixture_events
         WHERE type = 'goal' AND player_id IS NOT NULL
         GROUP BY player_id
         HAVING COUNT(*) > 5`,
      );
      for (const f of rows) expect(Number(f.goals)).toBeGreaterThan(5);
    });

    test("TC-167-Verify finished fixtures of matchday 1 or 2 using AND and IN", async () => {
      // Workbench: 6 rows
      const rows = await query(
        "SELECT * FROM fixtures WHERE status = 'finished' AND matchday IN (1,2)",
      );
      expect(rows.length).toBeGreaterThan(0);
      for (const f of rows) {
        expect(f.status).toBe("finished");
        expect([1, 2]).toContain(Number(f.matchday));
      }
    });

    test("TC-168-Verify standings are ordered by points in descending order", async () => {
      const rows = await query("SELECT * FROM standings ORDER BY points DESC");
      expect(rows.length).toBeGreaterThan(0);
      const points = rows.map((f) => Number(f.points));
      const sorted = [...points].sort((a, b) => b - a);
      expect(points).toEqual(sorted);
    });

    test("TC-169-Verify LIMIT 3 returns at most 3 players of team 1", async () => {
      const rows = await query("SELECT * FROM players WHERE team_id = 1 LIMIT 3");
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.length).toBeLessThanOrEqual(3);
      for (const f of rows) expect(Number(f.team_id)).toBe(1);
    });

    test("TC-170-Verify DESCRIBE teams shows the table structure and primary key", async () => {
      const rows = await query("DESCRIBE teams");
      const columns = rows.map((f) => f.Field);
      expect(columns).toEqual(
        expect.arrayContaining([
          "id",
          "name",
          "short_name",
          "logo_url",
          "league_id",
          "created_at",
          "updated_at",
        ]),
      );
      expect(rows.find((f) => f.Field === "id")?.Key).toBe("PRI");
    });
  });

  // ============================================================
  // Data analysis
  // ============================================================
  test.describe("Data analysis", () => {
    test("TC-171-Verify only valid player positions exist (GK, DEF, MID, FWD)", async () => {
      const rows = await query("SELECT DISTINCT position FROM players");
      expect(rows.length).toBeGreaterThan(0);
      for (const f of rows) expect(["GK", "DEF", "MID", "FWD"]).toContain(f.position);
    });

    test("TC-172-Verify there are no fixtures without a date", async () => {
      const rows = await query("SELECT * FROM fixtures WHERE date IS NULL");
      expect(rows).toHaveLength(0);
    });

    test("TC-173-Verify there are no players without a team (orphans)", async () => {
      const rows = await query("SELECT * FROM players WHERE team_id IS NULL");
      expect(rows).toHaveLength(0);
    });

    test("TC-174-Verify each finished fixture is classified correctly with CASE", async () => {
      const rows = await query(
        `SELECT id, home_score, away_score,
           CASE
             WHEN home_score > away_score THEN 'Gano el local'
             WHEN home_score < away_score THEN 'Gano visitante'
             ELSE 'Empate'
           END AS Resultado
         FROM fixtures WHERE status = 'finished'`,
      );
      expect(rows.length).toBeGreaterThan(0);
      for (const f of rows) {
        const home = Number(f.home_score);
        const away = Number(f.away_score);
        const expected =
          home > away ? "Gano el local" : home < away ? "Gano visitante" : "Empate";
        expect(f.Resultado, `fixture ${f.id}`).toBe(expected);
      }
    });

    test("TC-175-Verify the sum of players per team equals the total number of players", async () => {
      // Workbench: 21 players in 6 teams
      const byTeam = await query(
        "SELECT COUNT(id) AS total_players, team_id FROM players GROUP BY team_id",
      );
      const [row] = await query("SELECT COUNT(*) AS total FROM players");
      const sum = byTeam.reduce((acc, f) => acc + Number(f.total_players), 0);
      expect(sum).toBe(Number(row.total));
    });

    test("TC-176-Verify the AVG, SUM, MIN and MAX of goals per finished fixture", async () => {
      // Workbench: average 2.57, total 18, minimum 0, maximum 4 (with the data of that moment)
      const [aggregates] = await query(
        `SELECT AVG(home_score + away_score) AS average,
                SUM(home_score + away_score) AS total,
                MIN(home_score + away_score) AS minimum,
                MAX(home_score + away_score) AS maximum
         FROM fixtures WHERE status = 'finished'`,
      );
      // Recalculated in JS from the raw rows and compared
      const fixtures = await query(
        "SELECT home_score + away_score AS goals FROM fixtures WHERE status = 'finished'",
      );
      expect(fixtures.length).toBeGreaterThan(0);
      const goals = fixtures.map((p) => Number(p.goals));
      const total = goals.reduce((a, b) => a + b, 0);

      expect(Number(aggregates.total)).toBe(total);
      expect(Number(aggregates.minimum)).toBe(Math.min(...goals));
      expect(Number(aggregates.maximum)).toBe(Math.max(...goals));
      expect(Number(aggregates.average)).toBeCloseTo(total / goals.length, 1);
    });

    test("TC-177-Verify events grouped by type have valid types and sum to the total", async () => {
      // Workbench: 15 goals, 6 yellow cards, 2 red cards
      const byType = await query(
        "SELECT COUNT(type) AS total_events, type FROM fixture_events GROUP BY type",
      );
      expect(byType.length).toBeGreaterThan(0);
      for (const f of byType) {
        expect(["goal", "yellow_card", "red_card", "substitution"]).toContain(f.type);
      }
      const [row] = await query("SELECT COUNT(*) AS total FROM fixture_events");
      const sum = byType.reduce((acc, f) => acc + Number(f.total_events), 0);
      expect(sum).toBe(Number(row.total));
    });

    test("TC-178-Verify teams with more than 3 players using HAVING", async () => {
      const filtered = await query(
        `SELECT COUNT(team_id) AS total_players, team_id FROM players
         GROUP BY team_id HAVING COUNT(team_id) > 3`,
      );
      for (const f of filtered) expect(Number(f.total_players)).toBeGreaterThan(3);

      // Matches filtering the full grouping by hand (TC-175)
      const all = await query(
        "SELECT COUNT(id) AS total_players, team_id FROM players GROUP BY team_id",
      );
      const expected = all
        .filter((f) => Number(f.total_players) > 3)
        .map((f) => Number(f.team_id))
        .sort((a, b) => a - b);
      expect(filtered.map((f) => Number(f.team_id)).sort((a, b) => a - b)).toEqual(expected);
    });

    test("TC-179-Verify WHERE filters before grouping (finished fixtures per matchday)", async () => {
      const byMatchday = await query(
        `SELECT COUNT(id) AS total_fixtures, matchday FROM fixtures
         WHERE status = 'finished' GROUP BY matchday`,
      );
      const [row] = await query(
        "SELECT COUNT(*) AS total FROM fixtures WHERE status = 'finished'",
      );
      const sum = byMatchday.reduce((acc, f) => acc + Number(f.total_fixtures), 0);
      expect(sum).toBe(Number(row.total));
    });

    test("TC-180-Verify HAVING filters after grouping (matchdays with more than 2 fixtures)", async () => {
      const rows = await query(
        `SELECT COUNT(id) AS total_fixtures, matchday FROM fixtures
         GROUP BY matchday HAVING COUNT(id) > 2`,
      );
      for (const f of rows) expect(Number(f.total_fixtures)).toBeGreaterThan(2);
    });
  });

  // ============================================================
  // Relationships
  // ============================================================
  test.describe("Relationships", () => {
    test("TC-181-Verify the double INNER JOIN returns fixtures with home and away team names", async () => {
      const rows = await query(
        `SELECT f.home_score, f.away_score, f.status,
           local.name AS home_team, visitante.name AS away_team
         FROM fixtures f
         INNER JOIN teams local ON f.home_team_id = local.id
         INNER JOIN teams visitante ON f.away_team_id = visitante.id`,
      );
      expect(rows.length).toBeGreaterThan(0);
      for (const f of rows) {
        expect(typeof f.home_team).toBe("string");
        expect(f.home_team.length).toBeGreaterThan(0);
        expect(typeof f.away_team).toBe("string");
        expect(f.away_team.length).toBeGreaterThan(0);
      }

      // Every fixture has valid teams: the JOIN neither loses nor duplicates rows
      const [row] = await query("SELECT COUNT(*) AS total FROM fixtures");
      expect(rows.length).toBe(Number(row.total));
    });

    test("TC-182-Verify INNER JOIN returns players with their team name", async () => {
      // Workbench: 21 rows
      const rows = await query(
        `SELECT a.name AS player, b.name AS team FROM players a
         INNER JOIN teams b ON a.team_id = b.id`,
      );
      expect(rows.length).toBeGreaterThan(0);
      for (const f of rows) {
        expect(typeof f.team).toBe("string");
        expect(f.team.length).toBeGreaterThan(0);
      }

      const [row] = await query(
        "SELECT COUNT(*) AS total FROM players WHERE team_id IS NOT NULL",
      );
      expect(rows.length).toBe(Number(row.total));
    });

    test("TC-183-Verify INNER JOIN returns events with the player name", async () => {
      // Workbench: 23 rows
      const rows = await query(
        `SELECT a.name, b.type, b.minute FROM players a
         INNER JOIN fixture_events b ON a.id = b.player_id`,
      );
      expect(rows.length).toBeGreaterThan(0);
      const [row] = await query(
        "SELECT COUNT(*) AS total FROM fixture_events WHERE player_id IS NOT NULL",
      );
      expect(rows.length).toBe(Number(row.total));
    });

    test("TC-184-Verify LEFT JOIN finds teams without fixtures (corrected: joined by home_team_id / away_team_id)", async () => {
      // The original version joined by league_id and proved nothing about the
      // teams. It is joined by the real fixture ids. Invariant:
      // teams without fixtures + teams with fixtures (TC-189) = total teams.
      const withoutFixtures = await query(
        `SELECT t.id, t.name FROM teams t
         LEFT JOIN fixtures f ON t.id = f.home_team_id OR t.id = f.away_team_id
         WHERE f.id IS NULL`,
      );
      const withFixtures = await query(
        `SELECT id FROM teams WHERE id IN (
           SELECT home_team_id FROM fixtures
           UNION
           SELECT away_team_id FROM fixtures)`,
      );
      const [row] = await query("SELECT COUNT(*) AS total FROM teams");
      expect(withoutFixtures.length + withFixtures.length).toBe(Number(row.total));
    });

    test("TC-185-Verify LEFT JOIN finds players without any registered event", async () => {
      // Workbench: Armani, Montiel and Romero (with the data of that moment)
      const withoutEvents = await query(
        `SELECT a.id, a.name FROM players a
         LEFT JOIN fixture_events b ON a.id = b.player_id
         WHERE b.id IS NULL`,
      );
      const [row] = await query(
        `SELECT COUNT(*) AS total FROM players
         WHERE id NOT IN (SELECT player_id FROM fixture_events WHERE player_id IS NOT NULL)`,
      );
      expect(withoutEvents.length).toBe(Number(row.total));
    });

    test("TC-186-Verify CONCAT builds the player name and position", async () => {
      const rows = await query(
        `SELECT name, position, CONCAT(name, ' ', position) AS NameAndPosition FROM players`,
      );
      expect(rows.length).toBeGreaterThan(0);
      for (const f of rows) {
        expect(f.NameAndPosition).toBe(`${f.name} ${f.position}`);
      }
    });

    test("TC-187-Verify no team name has extra spaces (corrected: TRIM / LENGTH with <>)", async () => {
      // The original version returned the names WITHOUT problems. The
      // condition is inverted with <> and 0 rows are expected.
      const rows = await query(
        "SELECT name FROM teams WHERE LENGTH(name) <> LENGTH(TRIM(name))",
      );
      expect(rows).toHaveLength(0);
    });

    test("TC-188-Verify no player name has extra spaces", async () => {
      const rows = await query(
        "SELECT name FROM players WHERE LENGTH(name) <> LENGTH(TRIM(name))",
      );
      expect(rows).toHaveLength(0);
    });

    test("TC-189-Verify teams that played at least one fixture using IN and UNION", async () => {
      // Workbench: 6 teams
      const teams = await query(
        `SELECT id, name FROM teams WHERE id IN (
           SELECT home_team_id FROM fixtures
           UNION
           SELECT away_team_id FROM fixtures)`,
      );
      const idsInFixtures = await query(
        `SELECT home_team_id AS id FROM fixtures
         UNION
         SELECT away_team_id FROM fixtures`,
      );
      const expected = idsInFixtures.map((f) => Number(f.id)).sort((a, b) => a - b);
      const actual = teams.map((f) => Number(f.id)).sort((a, b) => a - b);
      expect(actual).toEqual(expected);
    });

    test("TC-190-Verify UNION removes duplicates while UNION ALL keeps them", async () => {
      const unionQuery = (operator: "UNION" | "UNION ALL") =>
        query(
          `SELECT name FROM players WHERE team_id = 1
           ${operator}
           SELECT name FROM players WHERE team_id = 2`,
        );

      const all = await unionQuery("UNION ALL");
      const withoutDuplicates = await unionQuery("UNION");
      const [row] = await query(
        "SELECT COUNT(*) AS total FROM players WHERE team_id IN (1, 2)",
      );

      // UNION ALL = all the rows of both queries
      expect(all.length).toBe(Number(row.total));
      // UNION = distinct names
      const distinct = new Set(all.map((f) => f.name));
      expect(withoutDuplicates.length).toBe(distinct.size);
      expect(withoutDuplicates.length).toBeLessThanOrEqual(all.length);
    });
  });

  // ============================================================
  // Advanced validations
  // ============================================================
  test.describe("Advanced validations", () => {
    test("TC-191-Verify the players of the leading team in standings using a subquery (no hardcoded id)", async () => {
      const players = await query(
        `SELECT name FROM players WHERE team_id = (
           SELECT team_id FROM standings ORDER BY points DESC LIMIT 1)`,
      );
      expect(players.length).toBeGreaterThan(0);

      // Compared against the leader obtained separately
      const [leader] = await query(
        "SELECT team_id FROM standings ORDER BY points DESC LIMIT 1",
      );
      const [row] = await query("SELECT COUNT(*) AS total FROM players WHERE team_id = ?", [
        leader.team_id,
      ]);
      expect(players.length).toBe(Number(row.total));
    });

    test("TC-192-Verify the active fixtures of the last matchday using a MAX subquery", async () => {
      // Workbench: 5 rows, matchday 4 (with the data of that moment)
      // Only active fixtures count (deleted_at IS NULL), as in the app: the
      // test fixtures soft-deleted by the API suite (matchday 99) must be ignored.
      const rows = await query(
        `SELECT * FROM fixtures
         WHERE deleted_at IS NULL
           AND matchday IN (SELECT MAX(matchday) FROM fixtures WHERE deleted_at IS NULL)`,
      );
      expect(rows.length).toBeGreaterThan(0);
      const [row] = await query("SELECT MAX(matchday) AS last_matchday FROM fixtures WHERE deleted_at IS NULL");
      for (const f of rows) expect(Number(f.matchday)).toBe(Number(row.last_matchday));
    });

    test("TC-193-Verify no orphan events reference a missing fixture (foreign key integrity)", async () => {
      const rows = await query(
        `SELECT b.* FROM fixture_events b
         LEFT JOIN fixtures a ON b.fixture_id = a.id
         WHERE a.id IS NULL`,
      );
      expect(rows).toHaveLength(0);
    });

    test("TC-194-Verify no duplicate emails exist in users (UNIQUE)", async () => {
      const rows = await query(
        `SELECT COUNT(email) AS repetitions FROM users
         GROUP BY email HAVING COUNT(email) > 1`,
      );
      expect(rows).toHaveLength(0);
    });

    test("TC-195-Verify active plus soft-deleted fixtures equal the total number of fixtures", async () => {
      // Fixtures deleted through the API stay in the table with deleted_at
      // (paranoid: true). Validates that every row is either active or deleted,
      // with no intermediate states.
      const [total] = await query("SELECT COUNT(*) AS total FROM fixtures");
      const [active] = await query(
        "SELECT COUNT(*) AS active FROM fixtures WHERE deleted_at IS NULL",
      );
      const [deleted] = await query(
        "SELECT COUNT(*) AS deleted FROM fixtures WHERE deleted_at IS NOT NULL",
      );
      expect(Number(active.active) + Number(deleted.deleted)).toBe(Number(total.total));
    });

    test("TC-196-Verify standings points equal won x 3 + drawn (logical CHECK)", async () => {
      const rows = await query("SELECT * FROM standings WHERE (won * 3 + drawn) <> points");
      expect(rows, "teams with inconsistent points").toHaveLength(0);
    });
  });
});
