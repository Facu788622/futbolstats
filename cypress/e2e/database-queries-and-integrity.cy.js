// ============================================================
// FEATURE: Database Queries and Integrity (migrated from MySQL Workbench)
// Test cases: TC-162 to TC-196
// Playwright equivalent: playwright/tests/database-queries-and-integrity.spec.ts
//
// The SQL cases, in 4 groups inside a single file (in the original order):
//   Basic queries            -> TC-162 to TC-170 (SQL cases 1-8, plus 4 completed)
//   Data analysis            -> TC-171 to TC-180 (SQL cases 9-17)
//   Relationships            -> TC-181 to TC-190 (SQL cases 18-25, plus 19b and 23b)
//   Advanced validations     -> TC-191 to TC-196 (SQL cases 26-31)
//
// How it works: cy.task("db:query") runs the SQL in the Cypress Node process
// (see cypress/tasks/db.js) and returns the rows as objects. The task only
// accepts read queries (SELECT / DESCRIBE / SHOW / WITH).
//
// Assertion criteria: the database changes (fixtures are created/deleted),
// so exact counts ("8 teams", "6 fixtures") are NOT hardcoded. Structure and
// invariants are verified instead: filters that hold for every row, empty
// results where they must be empty, and consistency between queries
// (e.g. the sum of players per team = total players).
// The values obtained in Workbench are kept as a comment in each case.
//
// The queries are the same as in Workbench; only aliases (AS) were added so
// each column can be read by name, and the two corrections found were applied
// (TC-184 and TC-187).
// ============================================================

// Runs a query and yields the rows
const query = (sql, params = []) => cy.task("db:query", { sql, params });

describe("Database Queries and Integrity", () => {
  // ============================================================
  // Basic queries
  // ============================================================
  describe("Basic queries", () => {
    it("TC-162-Verify SELECT * FROM teams returns teams with the expected columns", () => {
      // Workbench: 8 rows
      query("SELECT * FROM teams").then((rows) => {
        expect(rows).to.not.be.empty;
        expect(rows[0]).to.include.keys(
          "id",
          "name",
          "short_name",
          "logo_url",
          "league_id",
          "created_at",
          "updated_at",
        );
      });
    });

    it("TC-163-Verify SELECT * FROM fixtures returns fixtures with status, teams, date and scores", () => {
      query("SELECT * FROM fixtures").then((rows) => {
        expect(rows).to.not.be.empty;
        expect(rows[0]).to.include.keys(
          "id",
          "home_team_id",
          "away_team_id",
          "status",
          "date",
          "matchday",
          "home_score",
          "away_score",
        );
      });
    });

    it("TC-164-Verify filtering fixtures by status 'finished' returns only finished fixtures", () => {
      // Workbench: 6 rows
      query("SELECT * FROM fixtures WHERE status = 'finished'").then((rows) => {
        expect(rows).to.not.be.empty;
        rows.forEach((f) => expect(f.status).to.eq("finished"));
      });
    });

    it("TC-165-Verify goals live in fixture_events and each goal references a player", () => {
      // Exploratory query of the case: goals are not stored in players
      query("SELECT player_id FROM fixture_events WHERE type = 'goal'").then((rows) => {
        expect(rows).to.not.be.empty;
        rows.forEach((f) => expect(f).to.have.property("player_id"));
      });
    });

    it("TC-166-Verify players with more than 5 goals using GROUP BY and HAVING", () => {
      // Completes the case that had been left open. It may return 0 rows
      // if no player has more than 5 goals; what is validated is the threshold.
      query(
        `SELECT player_id, COUNT(*) AS goals
         FROM fixture_events
         WHERE type = 'goal' AND player_id IS NOT NULL
         GROUP BY player_id
         HAVING COUNT(*) > 5`,
      ).then((rows) => {
        rows.forEach((f) => expect(Number(f.goals)).to.be.greaterThan(5));
      });
    });

    it("TC-167-Verify finished fixtures of matchday 1 or 2 using AND and IN", () => {
      // Workbench: 6 rows
      query(
        "SELECT * FROM fixtures WHERE status = 'finished' AND matchday IN (1,2)",
      ).then((rows) => {
        expect(rows).to.not.be.empty;
        rows.forEach((f) => {
          expect(f.status).to.eq("finished");
          expect([1, 2]).to.include(Number(f.matchday));
        });
      });
    });

    it("TC-168-Verify standings are ordered by points in descending order", () => {
      query("SELECT * FROM standings ORDER BY points DESC").then((rows) => {
        expect(rows).to.not.be.empty;
        const points = rows.map((f) => Number(f.points));
        const sorted = [...points].sort((a, b) => b - a);
        expect(points).to.deep.eq(sorted);
      });
    });

    it("TC-169-Verify LIMIT 3 returns at most 3 players of team 1", () => {
      query("SELECT * FROM players WHERE team_id = 1 LIMIT 3").then((rows) => {
        expect(rows).to.not.be.empty;
        expect(rows.length).to.be.at.most(3);
        rows.forEach((f) => expect(Number(f.team_id)).to.eq(1));
      });
    });

    it("TC-170-Verify DESCRIBE teams shows the table structure and primary key", () => {
      query("DESCRIBE teams").then((rows) => {
        const columns = rows.map((f) => f.Field);
        expect(columns).to.include.members([
          "id",
          "name",
          "short_name",
          "logo_url",
          "league_id",
          "created_at",
          "updated_at",
        ]);
        expect(rows.find((f) => f.Field === "id").Key).to.eq("PRI");
      });
    });
  });

  // ============================================================
  // Data analysis
  // ============================================================
  describe("Data analysis", () => {
    it("TC-171-Verify only valid player positions exist (GK, DEF, MID, FWD)", () => {
      query("SELECT DISTINCT position FROM players").then((rows) => {
        expect(rows).to.not.be.empty;
        rows.forEach((f) => expect(["GK", "DEF", "MID", "FWD"]).to.include(f.position));
      });
    });

    it("TC-172-Verify there are no fixtures without a date", () => {
      query("SELECT * FROM fixtures WHERE date IS NULL").then((rows) => {
        expect(rows).to.be.empty;
      });
    });

    it("TC-173-Verify there are no players without a team (orphans)", () => {
      query("SELECT * FROM players WHERE team_id IS NULL").then((rows) => {
        expect(rows).to.be.empty;
      });
    });

    it("TC-174-Verify each finished fixture is classified correctly with CASE", () => {
      query(
        `SELECT id, home_score, away_score,
           CASE
             WHEN home_score > away_score THEN 'Gano el local'
             WHEN home_score < away_score THEN 'Gano visitante'
             ELSE 'Empate'
           END AS Resultado
         FROM fixtures WHERE status = 'finished'`,
      ).then((rows) => {
        expect(rows).to.not.be.empty;
        rows.forEach((f) => {
          const home = Number(f.home_score);
          const away = Number(f.away_score);
          const expected =
            home > away ? "Gano el local" : home < away ? "Gano visitante" : "Empate";
          expect(f.Resultado, `fixture ${f.id}`).to.eq(expected);
        });
      });
    });

    it("TC-175-Verify the sum of players per team equals the total number of players", () => {
      // Workbench: 21 players in 6 teams
      query("SELECT COUNT(id) AS total_players, team_id FROM players GROUP BY team_id").then(
        (byTeam) => {
          query("SELECT COUNT(*) AS total FROM players").then(([row]) => {
            const sum = byTeam.reduce((acc, f) => acc + Number(f.total_players), 0);
            expect(sum).to.eq(Number(row.total));
          });
        },
      );
    });

    it("TC-176-Verify the AVG, SUM, MIN and MAX of goals per finished fixture", () => {
      // Workbench: average 2.57, total 18, minimum 0, maximum 4 (with the data of that moment)
      query(
        `SELECT AVG(home_score + away_score) AS average,
                SUM(home_score + away_score) AS total,
                MIN(home_score + away_score) AS minimum,
                MAX(home_score + away_score) AS maximum
         FROM fixtures WHERE status = 'finished'`,
      ).then(([aggregates]) => {
        // Recalculated in JS from the raw rows and compared
        query(
          "SELECT home_score + away_score AS goals FROM fixtures WHERE status = 'finished'",
        ).then((fixtures) => {
          expect(fixtures).to.not.be.empty;
          const goals = fixtures.map((p) => Number(p.goals));
          const total = goals.reduce((a, b) => a + b, 0);

          expect(Number(aggregates.total)).to.eq(total);
          expect(Number(aggregates.minimum)).to.eq(Math.min(...goals));
          expect(Number(aggregates.maximum)).to.eq(Math.max(...goals));
          expect(Number(aggregates.average)).to.be.closeTo(total / goals.length, 0.01);
        });
      });
    });

    it("TC-177-Verify events grouped by type have valid types and sum to the total", () => {
      // Workbench: 15 goals, 6 yellow cards, 2 red cards
      query("SELECT COUNT(type) AS total_events, type FROM fixture_events GROUP BY type").then(
        (byType) => {
          expect(byType).to.not.be.empty;
          byType.forEach((f) =>
            expect(["goal", "yellow_card", "red_card", "substitution"]).to.include(f.type),
          );
          query("SELECT COUNT(*) AS total FROM fixture_events").then(([row]) => {
            const sum = byType.reduce((acc, f) => acc + Number(f.total_events), 0);
            expect(sum).to.eq(Number(row.total));
          });
        },
      );
    });

    it("TC-178-Verify teams with more than 3 players using HAVING", () => {
      query(
        `SELECT COUNT(team_id) AS total_players, team_id FROM players
         GROUP BY team_id HAVING COUNT(team_id) > 3`,
      ).then((filtered) => {
        filtered.forEach((f) => expect(Number(f.total_players)).to.be.greaterThan(3));

        // Matches filtering the full grouping by hand (TC-175)
        query("SELECT COUNT(id) AS total_players, team_id FROM players GROUP BY team_id").then(
          (all) => {
            const expected = all
              .filter((f) => Number(f.total_players) > 3)
              .map((f) => f.team_id)
              .sort();
            expect(filtered.map((f) => f.team_id).sort()).to.deep.eq(expected);
          },
        );
      });
    });

    it("TC-179-Verify WHERE filters before grouping (finished fixtures per matchday)", () => {
      query(
        `SELECT COUNT(id) AS total_fixtures, matchday FROM fixtures
         WHERE status = 'finished' GROUP BY matchday`,
      ).then((byMatchday) => {
        query("SELECT COUNT(*) AS total FROM fixtures WHERE status = 'finished'").then(
          ([row]) => {
            const sum = byMatchday.reduce((acc, f) => acc + Number(f.total_fixtures), 0);
            expect(sum).to.eq(Number(row.total));
          },
        );
      });
    });

    it("TC-180-Verify HAVING filters after grouping (matchdays with more than 2 fixtures)", () => {
      query(
        `SELECT COUNT(id) AS total_fixtures, matchday FROM fixtures
         GROUP BY matchday HAVING COUNT(id) > 2`,
      ).then((rows) => {
        rows.forEach((f) => expect(Number(f.total_fixtures)).to.be.greaterThan(2));
      });
    });
  });

  // ============================================================
  // Relationships
  // ============================================================
  describe("Relationships", () => {
    it("TC-181-Verify the double INNER JOIN returns fixtures with home and away team names", () => {
      query(
        `SELECT f.home_score, f.away_score, f.status,
           local.name AS home_team, visitante.name AS away_team
         FROM fixtures f
         INNER JOIN teams local ON f.home_team_id = local.id
         INNER JOIN teams visitante ON f.away_team_id = visitante.id`,
      ).then((rows) => {
        expect(rows).to.not.be.empty;
        rows.forEach((f) => {
          expect(f.home_team).to.be.a("string").and.not.be.empty;
          expect(f.away_team).to.be.a("string").and.not.be.empty;
        });

        // Every fixture has valid teams: the JOIN neither loses nor duplicates rows
        query("SELECT COUNT(*) AS total FROM fixtures").then(([row]) => {
          expect(rows.length).to.eq(Number(row.total));
        });
      });
    });

    it("TC-182-Verify INNER JOIN returns players with their team name", () => {
      // Workbench: 21 rows
      query(
        `SELECT a.name AS player, b.name AS team FROM players a
         INNER JOIN teams b ON a.team_id = b.id`,
      ).then((rows) => {
        expect(rows).to.not.be.empty;
        rows.forEach((f) => expect(f.team).to.be.a("string").and.not.be.empty);

        query("SELECT COUNT(*) AS total FROM players WHERE team_id IS NOT NULL").then(
          ([row]) => {
            expect(rows.length).to.eq(Number(row.total));
          },
        );
      });
    });

    it("TC-183-Verify INNER JOIN returns events with the player name", () => {
      // Workbench: 23 rows
      query(
        `SELECT a.name, b.type, b.minute FROM players a
         INNER JOIN fixture_events b ON a.id = b.player_id`,
      ).then((rows) => {
        expect(rows).to.not.be.empty;
        query(
          "SELECT COUNT(*) AS total FROM fixture_events WHERE player_id IS NOT NULL",
        ).then(([row]) => {
          expect(rows.length).to.eq(Number(row.total));
        });
      });
    });

    it("TC-184-Verify LEFT JOIN finds teams without fixtures (corrected: joined by home_team_id / away_team_id)", () => {
      // The original version joined by league_id and proved nothing about the
      // teams. It is joined by the real fixture ids. Invariant:
      // teams without fixtures + teams with fixtures (TC-189) = total teams.
      query(
        `SELECT t.id, t.name FROM teams t
         LEFT JOIN fixtures f ON t.id = f.home_team_id OR t.id = f.away_team_id
         WHERE f.id IS NULL`,
      ).then((withoutFixtures) => {
        query(
          `SELECT id FROM teams WHERE id IN (
             SELECT home_team_id FROM fixtures
             UNION
             SELECT away_team_id FROM fixtures)`,
        ).then((withFixtures) => {
          query("SELECT COUNT(*) AS total FROM teams").then(([row]) => {
            expect(withoutFixtures.length + withFixtures.length).to.eq(Number(row.total));
          });
        });
      });
    });

    it("TC-185-Verify LEFT JOIN finds players without any registered event", () => {
      // Workbench: Armani, Montiel and Romero (with the data of that moment)
      query(
        `SELECT a.id, a.name FROM players a
         LEFT JOIN fixture_events b ON a.id = b.player_id
         WHERE b.id IS NULL`,
      ).then((withoutEvents) => {
        query(
          `SELECT COUNT(*) AS total FROM players
           WHERE id NOT IN (SELECT player_id FROM fixture_events WHERE player_id IS NOT NULL)`,
        ).then(([row]) => {
          expect(withoutEvents.length).to.eq(Number(row.total));
        });
      });
    });

    it("TC-186-Verify CONCAT builds the player name and position", () => {
      query(
        `SELECT name, position, CONCAT(name, ' ', position) AS NameAndPosition FROM players`,
      ).then((rows) => {
        expect(rows).to.not.be.empty;
        rows.forEach((f) => {
          expect(f.NameAndPosition).to.eq(`${f.name} ${f.position}`);
        });
      });
    });

    it("TC-187-Verify no team name has extra spaces (corrected: TRIM / LENGTH with <>)", () => {
      // The original version returned the names WITHOUT problems. The
      // condition is inverted with <> and 0 rows are expected.
      query("SELECT name FROM teams WHERE LENGTH(name) <> LENGTH(TRIM(name))").then(
        (rows) => {
          expect(rows).to.be.empty;
        },
      );
    });

    it("TC-188-Verify no player name has extra spaces", () => {
      query("SELECT name FROM players WHERE LENGTH(name) <> LENGTH(TRIM(name))").then(
        (rows) => {
          expect(rows).to.be.empty;
        },
      );
    });

    it("TC-189-Verify teams that played at least one fixture using IN and UNION", () => {
      // Workbench: 6 teams
      query(
        `SELECT id, name FROM teams WHERE id IN (
           SELECT home_team_id FROM fixtures
           UNION
           SELECT away_team_id FROM fixtures)`,
      ).then((teams) => {
        query(
          `SELECT home_team_id AS id FROM fixtures
           UNION
           SELECT away_team_id FROM fixtures`,
        ).then((idsInFixtures) => {
          const expected = idsInFixtures.map((f) => Number(f.id)).sort((a, b) => a - b);
          const actual = teams.map((f) => Number(f.id)).sort((a, b) => a - b);
          expect(actual).to.deep.eq(expected);
        });
      });
    });

    it("TC-190-Verify UNION removes duplicates while UNION ALL keeps them", () => {
      const unionQuery = (operator) =>
        query(
          `SELECT name FROM players WHERE team_id = 1
           ${operator}
           SELECT name FROM players WHERE team_id = 2`,
        );

      unionQuery("UNION ALL").then((all) => {
        unionQuery("UNION").then((withoutDuplicates) => {
          query("SELECT COUNT(*) AS total FROM players WHERE team_id IN (1, 2)").then(
            ([row]) => {
              // UNION ALL = all the rows of both queries
              expect(all.length).to.eq(Number(row.total));
              // UNION = distinct names
              const distinct = new Set(all.map((f) => f.name));
              expect(withoutDuplicates.length).to.eq(distinct.size);
              expect(withoutDuplicates.length).to.be.at.most(all.length);
            },
          );
        });
      });
    });
  });

  // ============================================================
  // Advanced validations
  // ============================================================
  describe("Advanced validations", () => {
    it("TC-191-Verify the players of the leading team in standings using a subquery (no hardcoded id)", () => {
      query(
        `SELECT name FROM players WHERE team_id = (
           SELECT team_id FROM standings ORDER BY points DESC LIMIT 1)`,
      ).then((players) => {
        expect(players).to.not.be.empty;

        // Compared against the leader obtained separately
        query("SELECT team_id FROM standings ORDER BY points DESC LIMIT 1").then(
          ([leader]) => {
            query("SELECT COUNT(*) AS total FROM players WHERE team_id = ?", [
              leader.team_id,
            ]).then(([row]) => {
              expect(players.length).to.eq(Number(row.total));
            });
          },
        );
      });
    });

    it("TC-192-Verify the fixtures of the last matchday using a MAX subquery", () => {
      // Workbench: 5 rows, matchday 4 (with the data of that moment)
      query(
        "SELECT * FROM fixtures WHERE matchday IN (SELECT MAX(matchday) FROM fixtures)",
      ).then((rows) => {
        expect(rows).to.not.be.empty;
        query("SELECT MAX(matchday) AS last_matchday FROM fixtures").then(([row]) => {
          rows.forEach((f) => expect(Number(f.matchday)).to.eq(Number(row.last_matchday)));
        });
      });
    });

    it("TC-193-Verify no orphan events reference a missing fixture (foreign key integrity)", () => {
      query(
        `SELECT b.* FROM fixture_events b
         LEFT JOIN fixtures a ON b.fixture_id = a.id
         WHERE a.id IS NULL`,
      ).then((rows) => {
        expect(rows).to.be.empty;
      });
    });

    it("TC-194-Verify no duplicate emails exist in users (UNIQUE)", () => {
      query(
        `SELECT COUNT(email) AS repetitions FROM users
         GROUP BY email HAVING COUNT(email) > 1`,
      ).then((rows) => {
        expect(rows).to.be.empty;
      });
    });

    it("TC-195-Verify active plus soft-deleted fixtures equal the total number of fixtures", () => {
      // Fixtures deleted through the API stay in the table with deleted_at
      // (paranoid: true). Validates that every row is either active or deleted,
      // with no intermediate states.
      query("SELECT COUNT(*) AS total FROM fixtures").then(([total]) => {
        query("SELECT COUNT(*) AS active FROM fixtures WHERE deleted_at IS NULL").then(
          ([active]) => {
            query(
              "SELECT COUNT(*) AS deleted FROM fixtures WHERE deleted_at IS NOT NULL",
            ).then(([deleted]) => {
              expect(Number(active.active) + Number(deleted.deleted)).to.eq(
                Number(total.total),
              );
            });
          },
        );
      });
    });

    it("TC-196-Verify standings points equal won x 3 + drawn (logical CHECK)", () => {
      query("SELECT * FROM standings WHERE (won * 3 + drawn) <> points").then((rows) => {
        expect(rows, "teams with inconsistent points").to.be.empty;
      });
    });
  });
});
